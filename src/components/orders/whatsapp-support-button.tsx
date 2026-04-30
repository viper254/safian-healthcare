"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANY_CONTACT } from "@/lib/constants";

type Props = {
  orderReference: string;
};

export function WhatsAppSupportButton({ orderReference }: Props) {
  function handleWhatsAppSupport() {
    const message = `Hi, I need help with my order ${orderReference}`;
    const whatsappUrl = `https://wa.me/${COMPANY_CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }

  return (
    <Button
      onClick={handleWhatsAppSupport}
      variant="default"
      className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
    >
      <MessageCircle className="size-4" />
      WhatsApp Support
    </Button>
  );
}
