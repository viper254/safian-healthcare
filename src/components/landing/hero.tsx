"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Stethoscope,
  HeartPulse,
  ShieldCheck,
  Truck,
  CreditCard,
  Syringe,
  Shield,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Category, CategorySlug } from "@/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { FREE_DELIVERY_OVER_KES } from "@/lib/constants";
import { formatKES } from "@/lib/utils";

type Slide = {
  slug: CategorySlug;
  eyebrow: string;
  titleTop: string;
  titleAccent: string;
  desc: string;
  image: string;
  tintFrom: string;
  tintTo: string;
};

const slides: Slide[] = [
  {
    slug: "diagnostic-essentials",
    eyebrow: "Diagnostic Essentials",
    titleTop: "Essential tools for",
    titleAccent: "accurate diagnosis",
    desc: "Stethoscopes, blood pressure machines, thermometers, pulse oximeters, glucometers and vital diagnostic equipment.",
    image:
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1600&q=80",
    tintFrom: "from-brand-green-500/30",
    tintTo: "to-brand-orange-500/20",
  },
  {
    slug: "procedure-practical-kits",
    eyebrow: "Procedure & Practical Kits",
    titleTop: "Hands-on training",
    titleAccent: "kits for students",
    desc: "IV cannulation kits, suturing kits, catheterization kits, dressing packs and emergency procedure training tools.",
    image:
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1600&q=80",
    tintFrom: "from-brand-orange-500/25",
    tintTo: "to-brand-green-500/20",
  },
  {
    slug: "medical-wear-protective-gear",
    eyebrow: "Medical Wear & Protective Gear",
    titleTop: "Professional attire",
    titleAccent: "for healthcare workers",
    desc: "Lab coats, scrubs, theatre caps, disposable gloves, face masks, aprons and complete protective gear solutions.",
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1600&q=80",
    tintFrom: "from-brand-green-500/30",
    tintTo: "to-brand-orange-500/25",
  },
  {
    slug: "clinical-academic-support-tools",
    eyebrow: "Clinical & Academic Support",
    titleTop: "Academic excellence",
    titleAccent: "support tools",
    desc: "Clinical pocket guides, OSCE preparation guides, drug reference booklets, logbooks and revision materials.",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=80",
    tintFrom: "from-brand-orange-500/30",
    tintTo: "to-brand-green-500/20",
  },
  {
    slug: "home-care-patient-support-devices",
    eyebrow: "Home Care & Patient Support",
    titleTop: "Quality care",
    titleAccent: "at home",
    desc: "Home BP machines, glucometers, wheelchairs, oxygen monitors, home care kits and elderly support solutions.",
    image:
      "https://images.unsplash.com/photo-1583912267550-d44c9c5f6c07?auto=format&fit=crop&w=1600&q=80",
    tintFrom: "from-brand-green-500/30",
    tintTo: "to-brand-orange-500/20",
  },
];

const categoryChips = [
  { icon: Stethoscope, label: "Diagnostic Essentials", href: "/shop/diagnostic-essentials" },
  { icon: Syringe, label: "Procedure Kits", href: "/shop/procedure-practical-kits" },
  { icon: Shield, label: "Protective Gear", href: "/shop/medical-wear-protective-gear" },
  { icon: BookOpen, label: "Academic Tools", href: "/shop/clinical-academic-support-tools" },
  { icon: HeartPulse, label: "Home Care", href: "/shop/home-care-patient-support-devices" },
];

const trustBadges = [
  { icon: ShieldCheck, label: "Certified medical-grade" },
  { icon: Truck, label: "Delivery: 24hrs-4 days" },
  { icon: CreditCard, label: "M-Pesa · Card · COD" },
];

export function Hero({ categories = [] }: { categories?: Category[] }) {
  const [idx, setIdx] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(FREE_DELIVERY_OVER_KES);

  // Fetch settings
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("settings")
      .select("value")
      .eq("key", "free_threshold")
      .single()
      .then(({ data }) => {
        if (data?.value) {
          setFreeDeliveryThreshold(parseInt(data.value));
        }
      });
  }, []);

  // Override each slide's image with the matching DB category's image_url so admin edits show.
  const effectiveSlides = useMemo<Slide[]>(() => {
    if (categories.length === 0) return slides;
    const bySlug = new Map(categories.map((c) => [c.slug, c]));
    return slides.map((slide) => {
      const cat = bySlug.get(slide.slug);
      return cat?.image_url ? { ...slide, image: cat.image_url } : slide;
    });
  }, [categories]);

  useEffect(() => {
    const t = setInterval(
      () => setIdx((i) => (i + 1) % effectiveSlides.length),
      5000,
    );
    return () => clearInterval(t);
  }, [effectiveSlides.length]);

  const s = effectiveSlides[idx] ?? effectiveSlides[0];

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Decorative tinted blobs */}
      <div className="pointer-events-none absolute inset-0 bg-brand-radial opacity-90" aria-hidden />
      <div className="container relative grid lg:grid-cols-2 items-center gap-12 py-14 md:py-24 lg:py-28">
        <div>
          <motion.span
            key={`eyebrow-${idx}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground ring-1 ring-primary/20"
          >
            <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse" />
            {s.eyebrow}
          </motion.span>

          <h1 className="mt-5 font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-balance">
            <AnimatePresence mode="wait">
              <motion.span
                key={`t-${idx}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.5 }}
                className="block"
              >
                {s.titleTop}{" "}
                <span className="text-brand-gradient">{s.titleAccent}</span>
              </motion.span>
            </AnimatePresence>
          </h1>

          <motion.p
            key={`d-${idx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl"
          >
            {s.desc}
          </motion.p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="gradient" className="shadow-lg shadow-primary/20">
              <Link href="/shop">
                Shop now
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#categories">View categories</Link>
            </Button>
          </div>

          {/* Trust badges */}
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
            {trustBadges.map(({ icon: Icon, label }) => (
              <li key={label} className="inline-flex items-center gap-2">
                <Icon className="size-4 text-secondary" />
                {label}
              </li>
            ))}
          </ul>

          {/* Category quick chips */}
          <div className="mt-8 flex flex-wrap gap-2">
            {categoryChips.map(({ icon: Icon, label, href }) => (
              <Link
                key={label}
                href={href}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-2 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Slide dots */}
          <div className="mt-8 flex items-center gap-2">
            {effectiveSlides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-8 bg-primary" : "w-3 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Visual */}
        <div className="relative aspect-square sm:aspect-[4/5] lg:aspect-square max-w-[560px] mx-auto w-full">
          {/* Background gradient glow */}
          <div
            className={`absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-br ${s.tintFrom} ${s.tintTo} blur-2xl`}
            aria-hidden
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={`img-${idx}`}
              initial={{ opacity: 0, scale: 0.96, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.96, rotate: 2 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative h-full w-full overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-black/5"
            >
              <Image
                src={s.image}
                alt={s.titleAccent}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority={idx === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent" />

              {/* Floating stat card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-56 rounded-2xl bg-white/95 backdrop-blur shadow-xl ring-1 ring-black/5 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-brand-gradient grid place-items-center shrink-0">
                    <HeartPulse className="size-5 text-white animate-heartbeat" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">Trusted by clinicians</p>
                    <p className="text-xs text-muted-foreground">1,200+ facilities served</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating pill badge */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute top-4 left-4 rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-semibold shadow"
              >
                Free delivery · Orders over {formatKES(freeDeliveryThreshold)}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
