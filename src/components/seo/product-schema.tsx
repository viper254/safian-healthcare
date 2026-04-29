import type { Product } from "@/types";
import { effectivePrice } from "@/lib/utils";

interface ProductSchemaProps {
  product: Product;
}

export function ProductSchema({ product }: ProductSchemaProps) {
  const { price } = effectivePrice(product);
  const imageUrl = product.images[0]?.url || "";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description || product.description,
    image: product.images.map(img => img.url),
    brand: {
      "@type": "Brand",
      name: product.brand || "Safian Healthcare",
    },
    sku: product.sku || product.id,
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${product.slug}`,
      priceCurrency: "KES",
      price: price,
      priceValidUntil: product.offer_expires_at || undefined,
      availability: product.stock_quantity > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Safian Healthcare & Medical Supplies",
      },
    },
    aggregateRating: product.rating_count > 0 ? {
      "@type": "AggregateRating",
      ratingValue: product.rating_avg,
      reviewCount: product.rating_count,
    } : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
