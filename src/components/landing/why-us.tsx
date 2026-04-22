"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  HeartHandshake,
  BadgeCheck,
  Headphones,
  PackageCheck,
} from "lucide-react";

const items = [
  {
    icon: BadgeCheck,
    title: "Medical-grade quality",
    desc: "Every product is sourced from vetted manufacturers and certified suppliers.",
  },
  {
    icon: Truck,
    title: "Countrywide delivery",
    desc: "Same-day Nairobi and next-day upcountry via trusted logistics partners.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty & returns",
    desc: "12-month warranty on devices. Hassle-free 7-day returns on unused items.",
  },
  {
    icon: HeartHandshake,
    title: "Clinician-led curation",
    desc: "Our catalogue is picked by practicing doctors, nurses and lab technologists.",
  },
  {
    icon: Headphones,
    title: "Dedicated support",
    desc: "Call, chat or WhatsApp our support team 7 days a week, 7am–10pm.",
  },
  {
    icon: PackageCheck,
    title: "Bulk & tender friendly",
    desc: "Quotations, LPO-based ordering and facility-level discounts for institutions.",
  },
];

export function WhyUs() {
  return (
    <section className="bg-muted/30 border-y">
      <div className="container py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Why choose Safian
          </p>
          <h2 className="mt-2 font-display font-bold text-3xl sm:text-4xl text-balance">
            Trusted by students, clinicians and facilities
          </h2>
          <p className="mt-3 text-muted-foreground">
            We exist to make quality medical supplies accessible, affordable and
            reliable across Kenya — whether you&apos;re buying your first stethoscope
            or equipping a 50-bed ward.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group rounded-2xl border bg-background p-6 hover:shadow-md transition-all"
            >
              <div className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-sm group-hover:scale-105 transition-transform">
                <item.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
