/**
 * Environment variable validation
 * Ensures all required env vars are present at build time
 */

function getEnvVar(key: string, required: boolean = true): string {
  const value = process.env[key];
  
  if (!value && required) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value || "";
}

export const env = {
  // Supabase (required)
  supabase: {
    url: getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  },
  
  // Site config (required)
  siteUrl: getEnvVar("NEXT_PUBLIC_SITE_URL"),
  
  // Contact info (optional - has defaults)
  contact: {
    phone: getEnvVar("NEXT_PUBLIC_CONTACT_PHONE", false) || "0756 597 813",
    whatsapp: getEnvVar("NEXT_PUBLIC_CONTACT_WHATSAPP", false) || "254756597813",
    email: getEnvVar("NEXT_PUBLIC_CONTACT_EMAIL", false) || "safianmedicalsupplies@gmail.com",
  },
  
  // Analytics (optional)
  analytics: {
    gaId: getEnvVar("NEXT_PUBLIC_GA_MEASUREMENT_ID", false),
  },
  
  // Node environment
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
} as const;

// Validate on import (will throw if invalid)
if (typeof window === "undefined") {
  console.log("✓ Environment variables validated");
}
