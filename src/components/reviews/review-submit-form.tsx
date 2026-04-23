"use client";

import { useState } from "react";
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const customerName = formData.get("customer_name") as string;
    const customerEmail = formData.get("customer_email") as string;
    const reviewText = formData.get("review_text") as string;

    if (!customerName || !reviewText || rating === 0) {
      setError("Please fill in all required fields and select a rating");
      setLoading(false);
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      
      const { error: submitError } = await supabase
        .from("reviews")
        .insert({
          customer_name: customerName,
          customer_email: customerEmail || null,
          rating,
          review_text: reviewText,
          is_approved: false, // Requires admin approval
        });

      if (submitError) throw submitError;

      setSuccess(true);
      // Reset form
      (e.target as HTMLFormElement).reset();
      setRating(0);
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border bg-green-50 dark:bg-green-950/20 p-8 text-center">
        <div className="size-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <Star className="size-6 text-green-600 dark:text-green-400 fill-current" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Thank You!</h3>
        <p className="text-muted-foreground mb-4">
          Your review has been submitted and is pending approval. We appreciate your feedback!
        </p>
        <Button
          onClick={() => setSuccess(false)}
          variant="outline"
        >
          Submit Another Review
        </Button>
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
            required
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
