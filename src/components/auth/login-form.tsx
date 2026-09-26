"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginAction } from "@/actions/auth";
import { loginSchema, type LoginInput } from "@/lib/validations";

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginInput) {
    setFormError(null);
    startTransition(async () => {
      const result = await loginAction({
        ...values,
        callbackUrl,
      });

      if (result.success && result.data) {
        toast.success(result.message ?? "Welcome back!");
        // Full navigation ensures the session cookie is applied before
        // protected layouts (admin/seller) run — avoids stale RSC errors.
        window.location.assign(result.data.redirectTo);
        return;
      }

      if (!result.success) {
        setFormError(result.error);
      }
    });
  }

  return (
    <Card className="relative overflow-hidden border border-border/80 bg-card/85 p-2 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-blue-500/30 hover:shadow-blue-500/10 dark:bg-card/75 rounded-3xl">
      {/* Top subtle highlight glow strip */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      <CardHeader className="space-y-1.5 text-center pt-6">
        <CardTitle className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Sign in to your Africhina Connect account
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="space-y-5 pt-2">
          {formError && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-2xl bg-destructive/10 border border-destructive/20 p-3.5 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <span>{formError}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </Label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors duration-200 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-11 rounded-2xl pl-10 pr-4 bg-background/60 border-border/70 transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs font-medium text-destructive animate-in fade-in duration-200">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors duration-200 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-11 rounded-2xl pl-10 pr-11 bg-background/60 border-border/70 transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors p-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-destructive animate-in fade-in duration-200">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-4 pb-6">
          <Button
            type="submit"
            className="group relative h-11 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_100%] font-medium text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:bg-[100%_0] hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70"
            disabled={pending}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </span>
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400 transition-colors"
            >
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

