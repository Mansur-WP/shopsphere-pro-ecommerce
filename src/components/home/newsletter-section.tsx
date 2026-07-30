"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 400));
      toast.success("You're on the list — thanks for subscribing!");
      setEmail("");
    });
  }

  return (
    <section className="border-t border-border/60 bg-muted/20 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            Stay in the loop
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            New drops, curated picks, and seller stories — no spam, unsubscribe
            anytime.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 flex-1 rounded-xl"
              aria-label="Email address"
            />
            <Button
              type="submit"
              disabled={pending}
              className="h-11 rounded-xl px-6"
            >
              {pending ? "Subscribing…" : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
