import { DELIVERY_FEES, FREE_DELIVERY_OVER_KES, MAJOR_TOWNS } from "@/lib/constants";

/**
 * Normalize a Kenyan mobile number to the local 0XXXXXXXXX format used by the
 * orders table and the international 254XXXXXXXXX format used by Daraja.
 */
export function normalizeKenyanPhone(input: string): {
  local: string;
  international: string;
} | null {
  const digits = input.replace(/\D/g, "");
  let local: string;

  if (digits.startsWith("254")) {
    local = `0${digits.slice(3)}`;
  } else if (digits.startsWith("0")) {
    local = digits;
  } else if (digits.length === 9 && /^[17]/.test(digits)) {
    local = `0${digits}`;
  } else {
    return null;
  }

  if (!/^0[17]\d{8}$/.test(local)) return null;
  return { local, international: `254${local.slice(1)}` };
}

export function calculateDeliveryFee(city: string, subtotal: number): number {
  if (subtotal >= FREE_DELIVERY_OVER_KES) return 0;

  const cityLower = city.toLowerCase().trim();
  if (cityLower.includes("nairobi")) return DELIVERY_FEES.NAIROBI;
  if (MAJOR_TOWNS.some((town) => cityLower.includes(town.toLowerCase()))) {
    return DELIVERY_FEES.MAJOR_TOWNS;
  }
  return DELIVERY_FEES.DEFAULT;
}
