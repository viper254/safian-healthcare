import { Hero } from "@/components/landing/hero";
import { MarqueeStrip } from "@/components/landing/marquee-strip";
import { CategoriesShowcase } from "@/components/landing/categories-showcase";
import { FeaturedBundles } from "@/components/landing/featured-bundles";
import { FeaturedProducts } from "@/components/landing/featured-products";
import { WhyUs } from "@/components/landing/why-us";
import { CallToAction } from "@/components/landing/cta";
import { getCategories, getFeaturedProducts, getProducts } from "@/lib/data";

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export const metadata = {
  title: "Home",
};

export default async function HomePage() {
  const [featured, allProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getProducts({ limit: 20 }),
    getCategories(),
  ]);
  
  return (
    <>
      <Hero categories={categories} />
      <MarqueeStrip />
      <CategoriesShowcase categories={categories} />
      <FeaturedBundles products={allProducts} />
      <FeaturedProducts products={featured} />
      <WhyUs />
      <CallToAction />
    </>
  );
}
