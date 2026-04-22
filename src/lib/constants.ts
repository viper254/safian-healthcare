import type { CategorySlug } from "@/types";

export const SITE_NAME = "Safian Healthcare & Supplies";
export const SITE_TAGLINE = "Trusted medical tools, kits & facility supplies";
export const SITE_SHORT = "Safian";
export const COMPANY_CONTACT = {
  phone: "+254 700 000 000",
  email: "orders@safian.co.ke",
  whatsapp: "+254700000000",
  address: "Biashara Street, Nairobi, Kenya",
};

export const CATEGORY_META: Record<
  CategorySlug,
  { name: string; description: string; icon: string; accent: "orange" | "green"; image: string }
> = {
  "medical-student-kits": {
    name: "Medical Student Kits",
    description:
      "Clinical bundles, dissection sets, anatomy models and study essentials for health students.",
    icon: "GraduationCap",
    accent: "orange",
    image:
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1600&q=80",
  },
  "professional-tools": {
    name: "Professional Tools",
    description:
      "Stethoscopes, otoscopes, diagnostic kits, surgical instruments for practicing clinicians.",
    icon: "Stethoscope",
    accent: "green",
    image:
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1600&q=80",
  },
  "facility-items": {
    name: "Facility Items",
    description:
      "Hospital beds, exam couches, trolleys, autoclaves and larger equipment for clinics & hospitals.",
    icon: "Building2",
    accent: "orange",
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1600&q=80",
  },
  "patient-supplies": {
    name: "Patient Supplies",
    description:
      "Mobility aids, wound care, oxygen, PPE, and consumables for patients and home care.",
    icon: "HeartPulse",
    accent: "green",
    image:
      "https://images.unsplash.com/photo-1583912267550-d44c9c5f6c07?auto=format&fit=crop&w=1600&q=80",
  },
};

export const CATEGORY_ORDER: CategorySlug[] = [
  "medical-student-kits",
  "professional-tools",
  "facility-items",
  "patient-supplies",
];

export const DELIVERY_FEE_KES = 350;
export const FREE_DELIVERY_OVER_KES = 15000;
