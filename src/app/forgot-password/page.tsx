"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Logo } from "@/components/brand/logo";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      const emailValue = String(form.get("email") ?? "").trim();
      setEmail(emailValue);

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(emailValue, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="container py-16 max-w-md">
        <div className="text-center">
          <Logo variant="full" />
        </div>
        <div className="mt-8 rounded-3xl border bg-card p-8 shadow-xl text-center">
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
            <CheckCircle2 className="size-8" />
          </div>
          
          <h1 className="font-display font-bold text-2xl mb-3">Check your email</h1>
          
          <p className="text-muted-foreground mb-6">
            We've sent a password reset link to <strong>{email}</strong>
          </p>

          <p className="text-sm text-muted-foreground mb-6">
            Click the link in the email to reset your password. The link will expire in 1 hour.
          </p>

          <Button asChild variant="outline" className="w-full">
            <Link href="/login">
              <ArrowLeft className="size-4" />
              Back to Sign In
            </Link>
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Didn't receive the email? Check your spam folder or{" "}
            <button
              onClick={() => setSuccess(false)}
              className="text-primary hover:underline"
            >
              try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-16 max-w-md">
      <div className="text-center">
        <Logo variant="full" />
      </div>
      <div className="mt-8 rounded-3xl border bg-card p-8 shadow-xl">
        <h1 className="font-display font-bold text-2xl">Reset your password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive text-destructive px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="pl-9"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="size-4" />
            Back to Sign In
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-xs text-muted-foreground mb-2">Need help?</p>
          <a href="tel:+254756597813" className="text-sm font-medium text-primary hover:underline">
            Call/WhatsApp: 0756 597 813
          </a>
        </div>
      </div>
    </div>
  );
}
