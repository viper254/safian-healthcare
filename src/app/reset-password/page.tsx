"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Logo } from "@/components/brand/logo";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const form = new FormData(e.currentTarget);
      const password = String(form.get("password") ?? "");
      const confirmPassword = String(form.get("confirmPassword") ?? "");

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
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
          
          <h1 className="font-display font-bold text-2xl mb-3">Password updated!</h1>
          
          <p className="text-muted-foreground mb-6">
            Your password has been successfully reset. Redirecting to sign in...
          </p>

          <Button asChild variant="gradient" className="w-full">
            <Link href="/login">
              Sign In Now
            </Link>
          </Button>
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
        <h1 className="font-display font-bold text-2xl">Set new password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your new password below.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive text-destructive px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                className="pl-9 pr-10"
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={6}
                className="pl-9 pr-10"
                placeholder="Re-enter password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
