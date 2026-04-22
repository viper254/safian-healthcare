"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Safian delivered my student kit in 2 days. The stethoscope quality rivals much more expensive brands, and support was super responsive.",
    name: "Dr. Amina Wanjiru",
    role: "Intern, Kenyatta National Hospital",
  },
  {
    quote:
      "We re-stocked our clinic from Safian last quarter — beds, autoclave, and consumables. Pricing, delivery, installation: all seamless.",
    name: "Mr. Peter Otieno",
    role: "Administrator, Afya Bora Clinic",
  },
  {
    quote:
      "The admin dashboard the team set up for us makes reordering PPE a two-click job. Huge time saver.",
    name: "Sr. Grace Mumbi",
    role: "Head Nurse, Uzima Health Centre",
  },
  {
    quote:
      "Every Safian delivery arrives well-packed and on time. Our students trust the brand for their clinical kits.",
    name: "Prof. John Mwangi",
    role: "Dean, Faculty of Medicine",
  },
];

export function Testimonials() {
  return (
    <section className="container py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          What they say
        </p>
        <h2 className="mt-2 font-display font-bold text-3xl sm:text-4xl text-balance">
          Real words from real clinicians
        </h2>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {testimonials.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="relative flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm"
          >
            <Quote className="size-6 text-primary/30" />
            <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90">
              “{t.quote}”
            </blockquote>
            <div className="mt-4 flex gap-0.5 text-brand-orange-500">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className="size-4 fill-current" />
              ))}
            </div>
            <figcaption className="mt-4 pt-4 border-t">
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
