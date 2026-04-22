import { Stethoscope, HeartPulse, Syringe, Pill, Activity, Cross, Microscope, Bandage } from "lucide-react";

const items = [
  { icon: Stethoscope, label: "Stethoscopes" },
  { icon: Syringe, label: "Injectables" },
  { icon: HeartPulse, label: "BP Monitors" },
  { icon: Pill, label: "Pharmacy supplies" },
  { icon: Activity, label: "Diagnostics" },
  { icon: Microscope, label: "Lab equipment" },
  { icon: Cross, label: "First aid" },
  { icon: Bandage, label: "Wound care" },
];

export function MarqueeStrip() {
  return (
    <div className="border-y bg-muted/40 overflow-hidden">
      <div className="flex gap-12 py-5 animate-marquee whitespace-nowrap will-change-transform">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2.5 text-sm font-semibold text-muted-foreground"
          >
            <item.icon className="size-5 text-primary" />
            {item.label}
            <span className="mx-3 size-1 rounded-full bg-muted-foreground/50" />
          </span>
        ))}
      </div>
    </div>
  );
}
