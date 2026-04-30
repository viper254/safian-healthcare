import { ReviewSubmitForm } from "@/components/reviews/review-submit-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SubmitReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; name?: string }>;
}) {
  const params = await searchParams;
  const productId = params.product;
  const productName = params.name;

  return (
    <div className="container py-12 max-w-2xl">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>
      
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">
          {productName ? `Review: ${productName}` : "Share Your Experience"}
        </h1>
        <p className="text-muted-foreground">
          {productName 
            ? "Tell us about your experience with this product"
            : "Your feedback helps us serve you better and helps other customers make informed decisions."}
        </p>
      </div>

      <ReviewSubmitForm productId={productId} productName={productName} />
    </div>
  );
}
