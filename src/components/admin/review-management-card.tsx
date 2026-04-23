"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Check, X, MessageSquare, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface Review {
  id: string;
  customer_name: string;
  customer_email: string | null;
  rating: number;
  review_text: string;
  is_approved: boolean;
  is_featured: boolean;
  admin_response: string | null;
  created_at: string;
}

export function ReviewManagementCard({ review }: { review: Review }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [response, setResponse] = useState(review.admin_response || "");

  async function handleApprove() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: true }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!confirm("Delete this review?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "DELETE",
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleFeature() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: !review.is_featured }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveResponse() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_response: response }),
      });
      if (res.ok) {
        setShowResponse(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`rounded-lg border p-4 ${review.is_featured ? "border-yellow-400 bg-yellow-50/50" : "bg-card"}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold">{review.customer_name}</p>
          <div className="flex gap-0.5 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-3 ${
                  i < review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
        {review.is_featured && (
          <Sparkles className="size-4 text-yellow-600" />
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-3">"{review.review_text}"</p>

      {review.admin_response && (
        <div className="bg-muted/50 rounded p-2 mb-3 text-sm">
          <p className="font-medium text-xs mb-1">Admin Response:</p>
          <p>{review.admin_response}</p>
        </div>
      )}

      {showResponse && (
        <div className="mb-3 space-y-2">
          <Textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write your response..."
            rows={3}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveResponse} disabled={loading}>
              Save Response
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowResponse(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {!review.is_approved && (
          <>
            <Button size="sm" onClick={handleApprove} disabled={loading}>
              <Check className="size-3 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleReject}
              disabled={loading}
            >
              <X className="size-3 mr-1" />
              Reject
            </Button>
          </>
        )}
        {review.is_approved && (
          <>
            <Button
              size="sm"
              variant={review.is_featured ? "default" : "outline"}
              onClick={handleFeature}
              disabled={loading}
            >
              <Sparkles className="size-3 mr-1" />
              {review.is_featured ? "Featured" : "Feature"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowResponse(!showResponse)}
            >
              <MessageSquare className="size-3 mr-1" />
              Respond
            </Button>
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        {new Date(review.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
    </div>
  );
}
