"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Stethoscope,
  HeartPulse,
  Building2,
  ArrowUpRight,
  Syringe,
  Shield,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/constants";
import type { CategorySlug } from "@/types";

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  Stethoscope,
  HeartPulse,
  Building2,
  Syringe,
  Shield,
  BookOpen,
};

export function CategoriesShowcase() {
  return (
    <section id="categories" className="container py-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Shop by category
          </p>
          <h2 className="mt-2 font-display font-bold text-3xl sm:text-4xl text-balance">
            Everything for <span className="text-brand-gradient">every role</span>
          </h2>
        </div>
        <p className="max-w-md text-muted-foreground text-sm">
          From medical students to healthcare professionals, facilities, and patients — we provide comprehensive medical supplies and equipment across five specialized categories.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
        {CATEGORY_ORDER.map((slug, i) => (
          <CategoryCard key={slug} slug={slug} index={i} />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({ slug, index }: { slug: CategorySlug; index: number }) {
  const meta = CATEGORY_META[slug];
  const Icon = iconMap[meta.icon] ?? Stethoscope;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Link
        href={`/shop/${slug}`}
        className="group relative block overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={meta.image}
            alt={meta.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div
            className={`absolute top-3 left-3 inline-flex size-10 items-center justify-center rounded-xl shadow-md ${
              meta.accent === "orange"
                ? "bg-brand-orange-500 text-white"
                : "bg-brand-green-500 text-white"
            }`}
          >
            <Icon className="size-5" />
          </div>
          <ArrowUpRight className="absolute top-3 right-3 size-5 text-white/80 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-base">{meta.name}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
            {meta.description}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            Browse range
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
