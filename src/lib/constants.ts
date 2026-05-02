import type { CategorySlug } from "@/types";

export const SITE_NAME = "SAFIAN HEALTHCARE & MEDICAL SUPPLIES";
export const SITE_TAGLINE = "Trusted medical tools, kits & facility supplies";
export const SITE_SHORT = "Safian";
export const COMPANY_CONTACT = {
  phone: "+254756597813",
  phoneFormatted: "+254 756 597 813",
  email: "info@safianhealthcare.com",
  whatsapp: "254756597813", // Format for WhatsApp API (no + or spaces)
  whatsappDisplay: "+254 756 597 813",
  tillNumber: "5517358", // M-Pesa Till Number
  address: "Platinum Plaza, Nairobi CBD",
};

export const CATEGORY_META: Record<
  CategorySlug,
  { name: string; description: string; icon: string; accent: "orange" | "green"; image: string }
> = {
  "medical-students": {
    name: "Medical Students",
    description:
      "Essential tools and supplies for medical students including diagnostic equipment, study materials, and practical kits.",
    icon: "GraduationCap",
    accent: "green",
    image: "",
  },
  "doctors-and-professionals": {
    name: "Doctors and Professionals",
    description:
      "Professional-grade medical equipment and supplies for practicing doctors and healthcare professionals.",
    icon: "Stethoscope",
    accent: "orange",
    image: "",
  },
  "facilities-hospitals-clinics": {
    name: "Facilities, Hospitals and Clinics",
    description:
      "Bulk medical supplies, equipment, and facility management solutions for hospitals, clinics, and healthcare facilities.",
    icon: "Building2",
    accent: "green",
    image: "",
  },
  "general-public-patients-hbc": {
    name: "General Public and Patients [HBC]",
    description:
      "Home-based care supplies, patient support devices, and medical products for general public use.",
    icon: "Users",
    accent: "orange",
    image: "",
  },
  "diagnostic-essentials": {
    name: "Diagnostic Essentials",
    description:
      "Stethoscopes, blood pressure machines, thermometers, pulse oximeters, glucometers and essential diagnostic tools.",
    icon: "Stethoscope",
    accent: "green",
    image:
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1600&q=80",
  },
  "procedure-practical-kits": {
    name: "Procedure & Practical Kits",
    description:
      "IV cannulation kits, suturing kits, catheterization kits, dressing packs, minor surgical kits and emergency procedure kits.",
    icon: "Syringe",
    accent: "orange",
    image:
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1600&q=80",
  },
  "medical-wear-protective-gear": {
    name: "Medical Wear & Protective Gear",
    description:
      "Lab coats, scrubs, theatre caps, disposable gloves, face masks, aprons and protective gowns for medical professionals.",
    icon: "Shield",
    accent: "green",
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1600&q=80",
  },
  "clinical-academic-support-tools": {
    name: "Clinical & Academic Support Tools",
    description:
      "Clinical pocket guides, OSCE preparation guides, drug reference booklets, logbooks, case presentation templates and revision notes.",
    icon: "BookOpen",
    accent: "orange",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1600&q=80",
  },
  "home-care-patient-support-devices": {
    name: "Home Care & Patient Support Devices",
    description:
      "Home BP machines, glucometers, wheelchairs, oxygen saturation monitors, home care kits and elderly care support packs.",
    icon: "HeartPulse",
    accent: "green",
    image:
      "https://images.unsplash.com/photo-1583912267550-d44c9c5f6c07?auto=format&fit=crop&w=1600&q=80",
  },
};

export const CATEGORY_ORDER: CategorySlug[] = [
  "medical-students",
  "doctors-and-professionals",
  "facilities-hospitals-clinics",
  "general-public-patients-hbc",
  "diagnostic-essentials",
  "procedure-practical-kits",
  "medical-wear-protective-gear",
  "clinical-academic-support-tools",
  "home-care-patient-support-devices",
];

// Delivery fee structure
export const DELIVERY_FEES = {
  NAIROBI: 200,
  MAJOR_TOWNS: 300,
  DEFAULT: 350,
};

export const FREE_DELIVERY_OVER_KES = 25000;

// Major towns with fixed delivery fee
export const MAJOR_TOWNS = [
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Malindi",
  "Kitale",
  "Garissa",
  "Kakamega",
  "Nyeri",
  "Meru",
  "Naivasha",
];

// Legacy constants for backward compatibility
export const DELIVERY_FEE_KES = DELIVERY_FEES.DEFAULT;
