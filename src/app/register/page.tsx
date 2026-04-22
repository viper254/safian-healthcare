"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, UserRound, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Logo } from "@/components/brand/logo";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const email = String(form.get("email") ?? "").trim();
      const password = String(form.get("password") ?? "");
      const fullName = String(form.get("full_name") ?? "");
      const phone = String(form.get("phone") ?? "");
      const hasSupabase = Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      );
      if (!hasSupabase) {
        setError(
          "Supabase isn't configured in this environment. Registration will work once NEXT_PUBLIC_SUPABASE_URL / ANON_KEY are set.",
        );
        return;
      }
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, phone } },
      });
      if (error) {
        setError(error.message);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-16 max-w-md">
      <div className="text-center">
        <Logo variant="full" />
      </div>
      <div className="mt-8 rounded-3xl border bg-card p-8 shadow-xl">
        <h1 className="font-display font-bold text-2xl">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Join Safian to track orders, save favourites and order faster.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input id="full_name" name="full_name" required className="pl-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input id="phone" name="phone" type="tel" required className="pl-9" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input id="email" name="email" type="email" required className="pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input id="password" name="password" type="password" required minLength={8} className="pl-9" />
            </div>
            <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
          </div>
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-brand-green-700 bg-brand-green-500/10 border border-brand-green-500/30 rounded-lg px-3 py-2">
              Account created — check your email to confirm, then sign in.
            </p>
          )}
          <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
            <ArrowRight className="size-4" />
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
