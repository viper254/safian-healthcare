import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Heart, Award, Globe2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About us",
  description: `Learn more about ${SITE_NAME} — our mission to supply quality, affordable medical equipment across Kenya.`,
};

const stats = [
  { label: "Clinical products", value: "500+" },
  { label: "Facilities served", value: "1,200+" },
  { label: "Counties covered", value: "47" },
  { label: "Years of service", value: "8" },
];

const values = [
  {
    icon: Heart,
    title: "Patient-first mindset",
    desc: "Every product we stock is judged by a single question: does it help a clinician deliver better care?",
  },
  {
    icon: Award,
    title: "Only trusted brands",
    desc: "Vetted manufacturers, certified imports, and documented warranties on every device.",
  },
  {
    icon: Globe2,
    title: "Everywhere, affordably",
    desc: "Rural clinics get the same prices as city hospitals. Bulk orders get institutional pricing.",
  },
  {
    icon: Users,
    title: "Team of clinicians",
    desc: "Our buyers are doctors and nurses. Our support team understands your daily reality.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-brand-radial opacity-80" />
        <div className="container py-16 md:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              About Safian
            </p>
            <h1 className="mt-3 font-display font-bold text-4xl sm:text-5xl text-balance">
              Supplying Kenya&apos;s healthcare frontlines since 2017.
            </h1>
            <p className="mt-5 text-muted-foreground max-w-xl">
              Safian Healthcare & Supplies was founded to bridge the gap between
              medical professionals and reliable, affordable equipment. Today we
              serve students, clinicians and facilities across every county in
              Kenya.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="gradient" size="lg">
                <Link href="/shop">Explore products</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Talk to us</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/5] max-w-md mx-auto w-full">
            <Image
              src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=80"
              alt="Safian team in warehouse"
              fill
              sizes="(max-width:1024px) 100vw, 40vw"
              className="object-cover rounded-3xl shadow-xl"
            />
          </div>
        </div>
      </section>

      <section className="container py-16">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border bg-card p-6 text-center">
              <dt className="text-sm text-muted-foreground">{s.label}</dt>
              <dd className="mt-1 font-display font-bold text-3xl text-brand-gradient">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-muted/40 border-y">
        <div className="container py-16">
          <h2 className="font-display font-bold text-3xl">What we stand for</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border bg-background p-6">
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm">
                  <v.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-semibold">{v.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
