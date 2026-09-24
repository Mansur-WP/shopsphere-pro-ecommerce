import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your Africhina Connect account",
};

async function LoginFormSlot({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  return <LoginForm callbackUrl={params.callbackUrl} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  return (
    <Suspense fallback={<Skeleton className="h-[480px] w-full rounded-xl" />}>
      <LoginFormSlot searchParams={searchParams} />
    </Suspense>
  );
}
