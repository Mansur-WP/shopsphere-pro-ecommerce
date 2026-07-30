import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    id: "credentials",
    name: "Email and Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email.toLowerCase().trim() },
      });

      if (!user?.password) return null;
      if (!user.isActive) return null;

      const valid = await bcrypt.compare(parsed.data.password, user.password);
      if (!valid) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/profile",
  },
  providers,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = (user.role as Role) ?? "CUSTOMER";
      }

      if (trigger === "update" && session?.user) {
        if (session.user.name) token.name = session.user.name;
        if (session.user.image) token.picture = session.user.image;
        if (session.user.role) token.role = session.user.role as Role;
      }

      // Always refresh role + active status from DB (role changes, deactivation)
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, name: true, image: true, isActive: true },
        });

        if (!dbUser || !dbUser.isActive) {
          return { ...token, error: "Deactivated" as const };
        }

        token.role = dbUser.role;
        token.name = dbUser.name;
        token.picture = dbUser.image;
        delete token.error;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.error === "Deactivated") {
        // Force client/server to treat session as unauthenticated
        return {
          ...session,
          user: undefined,
          expires: new Date(0).toISOString(),
        } as unknown as typeof session;
      }

      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) ?? "CUSTOMER";
        if (token.name) session.user.name = token.name as string;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
