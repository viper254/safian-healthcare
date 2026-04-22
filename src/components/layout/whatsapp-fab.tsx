"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { COMPANY_CONTACT } from "@/lib/constants";

export function WhatsAppFab() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const href = `https://wa.me/${COMPANY_CONTACT.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Hi Safian, I'd like help with an order.",
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-30 inline-flex size-14 items-center justify-center rounded-full bg-brand-green-500 text-white shadow-lg shadow-brand-green-500/30 hover:bg-brand-green-600 animate-pulse-ring"
    >
      <MessageCircle className="size-6" />
    </a>
  );
}
