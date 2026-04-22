import { Hero } from "@/components/landing/hero";
import { MarqueeStrip } from "@/components/landing/marquee-strip";
import { CategoriesShowcase } from "@/components/landing/categories-showcase";
import { FeaturedProducts } from "@/components/landing/featured-products";
import { WhyUs } from "@/components/landing/why-us";
import { Testimonials } from "@/components/landing/testimonials";
import { CallToAction } from "@/components/landing/cta";
import { getFeaturedProducts } from "@/lib/data";

export const revalidate = 60;

export default async function HomePage() {
  const featured = await getFeaturedProducts();
  return (
    <>
      <Hero />
      <MarqueeStrip />
      <CategoriesShowcase />
      <FeaturedProducts products={featured} />
      <WhyUs />
      <Testimonials />
      <CallToAction />
    </>
  );
}
