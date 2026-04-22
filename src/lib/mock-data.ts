import type { Category, Product, CategorySlug } from "@/types";
import { CATEGORY_META, CATEGORY_ORDER } from "./constants";

/**
 * Deterministic mock data used when Supabase env vars are missing (e.g. on
 * Vercel preview without the integration connected). Lets the whole site be
 * browsable end-to-end before the backend is wired up.
 */

export const mockCategories: Category[] = CATEGORY_ORDER.map((slug, i) => ({
  id: `cat-${i + 1}`,
  slug,
  name: CATEGORY_META[slug].name,
  description: CATEGORY_META[slug].description,
  icon: CATEGORY_META[slug].icon,
  sort_order: i,
  created_at: "2026-01-01T00:00:00Z",
}));

const img = (path: string) =>
  `https://images.unsplash.com/${path}?auto=format&fit=crop&w=1200&q=80`;

type MockProductSeed = {
  slug: string;
  name: string;
  category: CategorySlug;
  original: number;
  discount?: number;
  offer?: number;
  featured?: boolean;
  stock: number;
  brand: string;
  description: string;
  short: string;
  tags: string[];
  specs: Record<string, string>;
  images: string[];
};

const seeds: MockProductSeed[] = [
  {
    slug: "medical-student-starter-kit",
    name: "Medical Student Starter Kit",
    category: "medical-student-kits",
    original: 14500,
    discount: 11900,
    offer: 9990,
    featured: true,
    stock: 42,
    brand: "Safian",
    description:
      "Everything a first-year medical student needs: classic dual-head stethoscope, reusable aneroid BP cuff, penlight, reflex hammer, and a durable carry case.",
    short: "Stethoscope, BP cuff, penlight, reflex hammer + case",
    tags: ["bundle", "students", "beginner"],
    specs: {
      Includes: "Stethoscope, BP cuff, penlight, reflex hammer",
      Warranty: "1 year",
      Case: "Zipped hard-shell",
    },
    images: [
      img("photo-1584982751601-97dcc096659c"),
      img("photo-1579154204601-01588f351e67"),
      img("photo-1579684385127-1ef15d508118"),
    ],
  },
  {
    slug: "anatomy-dissection-set-24pc",
    name: "Anatomy Dissection Set (24 pieces)",
    category: "medical-student-kits",
    original: 6200,
    discount: 4900,
    featured: true,
    stock: 58,
    brand: "Safian",
    description:
      "Stainless-steel dissection kit for anatomy & histology labs. 24 precision instruments in a compact zipped pouch.",
    short: "Stainless steel · 24 precision instruments",
    tags: ["dissection", "anatomy"],
    specs: { Pieces: "24", Material: "Stainless steel", Case: "Zipped pouch" },
    images: [
      img("photo-1581594693702-fbdc51b2763b"),
      img("photo-1576091160550-2173dba999ef"),
    ],
  },
  {
    slug: "clinical-skills-practice-pack",
    name: "Clinical Skills Practice Pack",
    category: "medical-student-kits",
    original: 8900,
    stock: 30,
    brand: "Safian",
    description:
      "Suturing pad, IV cannulation arm trainer, and a syringe practice kit for hands-on clinical skills training.",
    short: "Suture pad, IV trainer, syringe kit",
    tags: ["osce", "practice"],
    specs: { Includes: "Suture pad, IV arm, syringe kit", Reusable: "Yes" },
    images: [
      img("photo-1631815588090-d4bfec5b1ccb"),
      img("photo-1578496780896-7081cc23c111"),
    ],
  },
  {
    slug: "classic-dual-head-stethoscope",
    name: "Classic Dual-Head Stethoscope",
    category: "professional-tools",
    original: 5500,
    discount: 4400,
    featured: true,
    stock: 120,
    brand: "Safian Pro",
    description:
      "Acoustic dual-head stethoscope with tunable diaphragm, soft-seal eartips and anatomically angled binaural.",
    short: "Dual-head acoustic · Tunable diaphragm",
    tags: ["stethoscope", "diagnostic"],
    specs: {
      Diaphragm: "Tunable dual-head",
      Tubing: '22" Y-tube latex-free',
      Warranty: "2 years",
    },
    images: [
      img("photo-1631217868264-e5b90bb7e133"),
      img("photo-1551076805-e1869033e561"),
    ],
  },
  {
    slug: "digital-blood-pressure-monitor",
    name: "Digital Blood Pressure Monitor",
    category: "professional-tools",
    original: 7800,
    offer: 6500,
    featured: true,
    stock: 48,
    brand: "Omron",
    description:
      "Automatic upper-arm digital BP monitor with irregular heartbeat detection, 2-user memory (60 readings each) and backlit display.",
    short: "Auto upper-arm · 2-user memory · IHB detection",
    tags: ["blood pressure", "digital"],
    specs: {
      Range: "0–299 mmHg",
      Memory: "2 × 60 readings",
      Power: "4 × AA / USB-C",
    },
    images: [
      img("photo-1583912086296-be3ec99fbdab"),
      img("photo-1579684385127-1ef15d508118"),
    ],
  },
  {
    slug: "otoscope-ophthalmoscope-set",
    name: "Otoscope & Ophthalmoscope Set",
    category: "professional-tools",
    original: 28500,
    discount: 24900,
    stock: 18,
    brand: "Welch Allyn",
    description:
      "Fibre-optic otoscope and coaxial ophthalmoscope diagnostic set with hard carry case and rechargeable handle.",
    short: "Fibre-optic · Rechargeable · Hard case",
    tags: ["diagnostic", "ent"],
    specs: {
      Otoscope: "Fibre-optic illumination",
      Ophthalmoscope: "Coaxial, 28 apertures",
      Case: "Hard EVA",
    },
    images: [img("photo-1532938911079-1b06ac7ceec7"), img("photo-1504813184591-01572f98c85f")],
  },
  {
    slug: "surgical-instruments-basic-set",
    name: "Surgical Instruments — Basic Minor Set",
    category: "professional-tools",
    original: 12500,
    stock: 22,
    brand: "Safian Pro",
    description:
      "18-piece basic minor surgery set including mayo scissors, needle holder, tissue forceps, retractors and more.",
    short: "18 pcs · Stainless · Autoclavable",
    tags: ["surgery", "instruments"],
    specs: { Pieces: "18", Material: "Surgical stainless steel", Autoclavable: "Yes" },
    images: [img("photo-1581595218630-8dcefee3c64c"), img("photo-1576091160399-112ba8d25d1d")],
  },
  {
    slug: "adjustable-hospital-bed-3-crank",
    name: "Adjustable Hospital Bed (3-Crank)",
    category: "facility-items",
    original: 89500,
    discount: 79900,
    featured: true,
    stock: 6,
    brand: "MediCare",
    description:
      "Manual 3-crank adjustable bed with side rails, IV stand mount, removable head/foot boards and epoxy-coated frame.",
    short: "3-crank · Side rails · IV mount",
    tags: ["bed", "ward"],
    specs: {
      Dimensions: "210 × 90 × 50 cm",
      Capacity: "200 kg",
      Frame: "Epoxy-coated steel",
    },
    images: [
      img("photo-1586773860418-d37222d8fce3"),
      img("photo-1579684385127-1ef15d508118"),
    ],
  },
  {
    slug: "examination-couch-deluxe",
    name: "Examination Couch — Deluxe",
    category: "facility-items",
    original: 32500,
    offer: 27900,
    stock: 12,
    brand: "MediCare",
    description:
      "Deluxe examination couch with padded leatherette top, adjustable backrest and paper-roll holder.",
    short: "Padded · Adjustable backrest · Paper holder",
    tags: ["exam", "clinic"],
    specs: { Length: "1.9 m", Capacity: "180 kg", Upholstery: "Medical leatherette" },
    images: [img("photo-1519494026892-80bbd2d6fd0d"), img("photo-1579154204601-01588f351e67")],
  },
  {
    slug: "autoclave-sterilizer-18l",
    name: "Autoclave Sterilizer (18 L)",
    category: "facility-items",
    original: 65000,
    stock: 8,
    brand: "Daihan",
    description:
      "Benchtop Class N autoclave with 18 L chamber, digital controls, and auto-lock safety door.",
    short: "Class N · 18 L · Digital",
    tags: ["sterilization", "lab"],
    specs: { Chamber: "18 L", Temperature: "121–134 °C", Power: "2 kW" },
    images: [img("photo-1606206591513-adbfbdd7a177"), img("photo-1581594693702-fbdc51b2763b")],
  },
  {
    slug: "adjustable-aluminium-crutches-pair",
    name: "Adjustable Aluminium Crutches (Pair)",
    category: "patient-supplies",
    original: 3800,
    discount: 2990,
    featured: true,
    stock: 65,
    brand: "MobilityCare",
    description:
      "Lightweight adjustable aluminium underarm crutches with padded armrests and non-slip rubber tips.",
    short: "Aluminium · Adjustable · Non-slip tips",
    tags: ["mobility", "crutches"],
    specs: { Material: "Aluminium", Height: "Adjustable 119–150 cm", Capacity: "120 kg" },
    images: [img("photo-1583912267550-d44c9c5f6c07"), img("photo-1576091160550-2173dba999ef")],
  },
  {
    slug: "wheelchair-folding-standard",
    name: "Folding Wheelchair — Standard",
    category: "patient-supplies",
    original: 18500,
    offer: 15500,
    stock: 9,
    brand: "MobilityCare",
    description:
      "Folding wheelchair with swing-away footrests, padded armrests and puncture-proof tyres.",
    short: "Folding · Swing footrests · PU tyres",
    tags: ["wheelchair", "mobility"],
    specs: { Capacity: "110 kg", Weight: "17 kg", Wheels: "24\" rear, 8\" front" },
    images: [img("photo-1580281657527-47d4b6d8e3f8"), img("photo-1559757148-5c350d0d3c56")],
  },
  {
    slug: "oxygen-concentrator-5l",
    name: "Oxygen Concentrator 5 L",
    category: "patient-supplies",
    original: 55000,
    discount: 49900,
    stock: 7,
    brand: "Yuwell",
    description:
      "Home 5 L/min oxygen concentrator with nebulizer outlet, 93% purity, and quiet operation.",
    short: "5 L/min · 93% purity · Quiet",
    tags: ["oxygen", "home-care"],
    specs: { Flow: "0.5–5 L/min", Purity: "93% ± 3%", Noise: "≤ 42 dB" },
    images: [img("photo-1588776814546-1ffcf47267a7"), img("photo-1579154204601-01588f351e67")],
  },
  {
    slug: "ppe-essentials-pack",
    name: "PPE Essentials Pack",
    category: "patient-supplies",
    original: 2400,
    offer: 1899,
    featured: true,
    stock: 200,
    brand: "Safian",
    description:
      "50 surgical masks, 100 nitrile gloves, and 10 disposable gowns. Everyday facility PPE in one pack.",
    short: "50 masks · 100 gloves · 10 gowns",
    tags: ["ppe", "consumables"],
    specs: { Masks: "50 × 3-ply", Gloves: "100 × nitrile", Gowns: "10 × disposable" },
    images: [img("photo-1584308666744-24d5c474f2ae"), img("photo-1576091160399-112ba8d25d1d")],
  },
];

let counter = 0;
export const mockProducts: Product[] = seeds.map((s) => {
  counter += 1;
  const category = mockCategories.find((c) => c.slug === s.category)!;
  return {
    id: `prod-${counter}`,
    slug: s.slug,
    name: s.name,
    description: s.description,
    short_description: s.short,
    category_id: category.id,
    category,
    original_price: s.original,
    discounted_price: s.discount ?? null,
    offer_price: s.offer ?? null,
    offer_expires_at: null,
    stock_quantity: s.stock,
    low_stock_threshold: 5,
    is_featured: s.featured ?? false,
    is_active: true,
    sku: `SAF-${String(counter).padStart(4, "0")}`,
    brand: s.brand,
    tags: s.tags,
    images: s.images.map((u, i) => ({ url: u, alt: `${s.name} image ${i + 1}` })),
    specs: s.specs,
    rating_avg: 4 + Math.random() * 0.9,
    rating_count: 10 + Math.floor(Math.random() * 120),
    created_at: new Date(Date.now() - counter * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };
});

export function mockProductsByCategory(slug: CategorySlug): Product[] {
  return mockProducts.filter((p) => p.category?.slug === slug);
}

export function mockProductBySlug(slug: string): Product | undefined {
  return mockProducts.find((p) => p.slug === slug);
}

export function mockFeatured(): Product[] {
  return mockProducts.filter((p) => p.is_featured);
}
