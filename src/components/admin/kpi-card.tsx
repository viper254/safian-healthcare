"use client";

import { motion } from "framer-motion";
import { 
  TrendingDown, 
  TrendingUp, 
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  type LucideIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
};

export function KpiCard({
  label,
  value,
  delta,
  icon,
  accent = "orange",
  index = 0,
}: {
  label: string;
  value: string;
  delta?: number;
  icon: string;
  accent?: "orange" | "green" | "blue" | "purple";
  index?: number;
}) {
  const Icon = iconMap[icon] || Package;
  const isUp = (delta ?? 0) >= 0;
  const accentBg: Record<string, string> = {
    orange: "bg-brand-orange-500",
    green: "bg-brand-green-500",
    blue: "bg-sky-500",
    purple: "bg-violet-500",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display font-bold text-2xl">{value}</p>
        </div>
        <span
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-xl text-white shadow-sm",
            accentBg[accent],
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>
      {delta !== undefined && (
        <div
          className={cn(
            "mt-3 inline-flex items-center gap-1 text-xs font-semibold",
            isUp ? "text-brand-green-600" : "text-destructive",
          )}
        >
          {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {isUp ? "+" : ""}
          {delta}% vs last 30 days
        </div>
      )}
    </motion.div>
  );
}
