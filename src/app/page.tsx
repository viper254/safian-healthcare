import { Hero } from "@/components/landing/hero";
import { MarqueeStrip } from "@/components/landing/marquee-strip";
import { CategoriesShowcase } from "@/components/landing/categories-showcase";
import { FeaturedBundles } from "@/components/landing/featured-bundles";
import { FeaturedProducts } from "@/components/landing/featured-products";
import { WhyUs } from "@/components/landing/why-us";
import { CallToAction } from "@/components/landing/cta";
import { getFeaturedProducts, getProducts } from "@/lib/data";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, allProducts] = await Promise.all([
    getFeaturedProducts(),
    getProducts({ limit: 20 }),
  ]);
  
  return (
    <>
      <Hero />
      <MarqueeStrip />
      <CategoriesShowcase />
      <FeaturedBundles products={allProducts} />
      <FeaturedProducts products={featured} />
      <WhyUs />
      <CallToAction />
    </>
  );
}
