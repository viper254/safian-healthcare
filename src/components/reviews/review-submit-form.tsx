"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ReviewSubmitForm() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Auto-fill customer details if logged in
  useEffect(() => {
    async function loadUserProfile() {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          if (profile.full_name) setCustomerName(profile.full_name);
          if (profile.email) setCustomerEmail(profile.email);
        } else if (user.email) {
          setCustomerEmail(user.email);
        }
      }
    }
    loadUserProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("customer_name") as string;
    const email = formData.get("customer_email") as string;
    const reviewText = formData.get("review_text") as string;

    if (!name || !reviewText || rating === 0) {
      setError("Please fill in all required fields and select a rating");
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      
      // We remove user_id from the insert because it's not in the current schema
      const { error: submitError } = await supabase
        .from("reviews")
        .insert({
          customer_name: name,
          customer_email: email || null,
          rating,
          review_text: reviewText,
          is_approved: false, // Requires admin approval
        });

      if (submitError) throw submitError;

      setSuccess(true);
      // Reset form
      (e.target as HTMLFormElement).reset();
      setRating(0);
      setCustomerName("");
      setCustomerEmail("");
    } catch (err: any) {
      console.error("Review submission error:", err);
      setError(err.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border-2 border-brand-green-500/30 bg-gradient-to-br from-brand-green-50 to-white dark:from-brand-green-950/20 dark:to-background p-8 text-center shadow-lg">
        <div className="size-16 rounded-full bg-brand-green-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h3 className="font-display font-bold text-2xl mb-3 text-brand-green-700 dark:text-brand-green-400">
          Thank You for Your Feedback!
        </h3>
        <p className="text-muted-foreground mb-2 text-base">
          Your review has been submitted successfully and is awaiting approval from our team.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          We truly appreciate you taking the time to share your experience with us. Your feedback helps us improve our services and assists other customers in making informed decisions.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => setSuccess(false)}
            variant="gradient"
            size="lg"
          >
            Submit Another Review
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
          >
            <a href="/">Back to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <Label className="text-base font-semibold mb-3 block">
          Your Rating <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => {
            const starValue = i + 1;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "size-8 transition-colors",
                    (hoverRating || rating) >= starValue
                      ? "fill-brand-orange-500 text-brand-orange-500"
                      : "text-gray-300"
                  )}
                />
              </button>
            );
          })}
        </div>
        {rating > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            You rated: {rating} star{rating !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="customer_name">
            Your Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="customer_name"
            name="customer_name"
            placeholder="John Doe"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            autoComplete="name"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="customer_email">
            Email (Optional)
          </Label>
          <Input
            id="customer_email"
            name="customer_email"
            type="email"
            placeholder="john@example.com"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            autoComplete="email"
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            We'll never share your email publicly
          </p>
        </div>

        <div>
          <Label htmlFor="review_text">
            Your Review <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="review_text"
            name="review_text"
            placeholder="Tell us about your experience with Safian Healthcare..."
            required
            rows={6}
            className="mt-1.5"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full"
        size="lg"
        variant="gradient"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Your review will be reviewed by our team before being published
      </p>
    </form>
  );
}
