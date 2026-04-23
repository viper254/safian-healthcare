"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
}

interface ReviewsTickerProps {
  reviews: Review[];
}

export function ReviewsTicker({ reviews }: ReviewsTickerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || reviews.length === 0) return null;

  // Duplicate reviews for seamless loop
  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <div className="bg-gradient-to-r from-brand-green-600 to-brand-orange-500 text-white overflow-hidden">
      <div className="py-2">
        <div className="flex animate-scroll-left">
          {duplicatedReviews.map((review, index) => (
            <div
              key={`${review.id}-${index}`}
              className="flex items-center gap-3 px-8 whitespace-nowrap"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="size-3 fill-yellow-300 text-yellow-300" />
                ))}
              </div>
              <span className="text-sm font-medium">"{review.review_text}"</span>
              <span className="text-xs opacity-80">— {review.customer_name}</span>
              <span className="text-white/30">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
