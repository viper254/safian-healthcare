"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CreditCard,
  Smartphone,
  Banknote,
  Building,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Clock,
} from "lucide-react";
import { useCart } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatKES } from "@/lib/utils";
import { DELIVERY_FEES, FREE_DELIVERY_OVER_KES, COMPANY_CONTACT, MAJOR_TOWNS } from "@/lib/constants";
import type { PaymentMethod } from "@/types";

const methods: { id: PaymentMethod; label: string; icon: typeof CreditCard; desc: string; available: boolean }[] = [
  { id: "mpesa", label: "M-Pesa", icon: Smartphone, desc: "Coming soon", available: false },
  { id: "card", label: "Card", icon: CreditCard, desc: "Coming soon", available: false },
  { id: "bank_transfer", label: "Bank transfer", icon: Building, desc: "Coming soon", available: false },
  { id: "cash_on_delivery", label: "Cash on delivery", icon: Banknote, desc: "Coming soon", available: false },
];

function calculateDeliveryFee(city: string, subtotal: number): number {
  if (subtotal >= FREE_DELIVERY_OVER_KES) return 0;
  
  const cityLower = city.toLowerCase().trim();
  
  if (cityLower.includes("nairobi")) {
    return DELIVERY_FEES.NAIROBI;
  }
  
  if (MAJOR_TOWNS.some(town => cityLower.includes(town.toLowerCase()))) {
    return DELIVERY_FEES.MAJOR_TOWNS;
  }
  
  return DELIVERY_FEES.DEFAULT;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, clear } = useCart();
  const sub = subtotal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  // Auto-fill user details if logged in
  useEffect(() => {
    async function loadUserProfile() {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", user.id)
          .single();
        
        if (profile) {
          if (profile.full_name) setName(profile.full_name);
          if (profile.phone) setPhone(profile.phone);
        }
      }
    }
    loadUserProfile();
  }, []);
  
  const delivery = calculateDeliveryFee(city, sub);
  const total = sub + delivery;

  if (lines.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display font-bold text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add items before checking out.</p>
        <Button asChild className="mt-5" variant="gradient">
          <Link href="/shop">Back to shop</Link>
        </Button>
      </div>
    );
  }

  async function handleWhatsAppOrder() {
    if (!name.trim() || !phone.trim() || !city.trim()) {
      setError("Please enter your name, phone number, and city");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Create order in database first
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          city: city.trim(),
          lines,
          subtotal: sub,
          delivery_fee: delivery,
          total,
          payment_method: "whatsapp",
          payment_status: "unpaid",
          status: "pending",
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Order creation failed:", data);
        throw new Error(data.error || "Failed to create order");
      }

      if (!data.reference) {
        throw new Error("No order reference received");
      }

      const orderReference = data.reference;
      
      // Prepare WhatsApp message with order reference
      const itemsList = lines
        .map((l) => `* ${l.name}\n  (${formatKES(l.unit_price)} x ${l.quantity})`)
        .join("\n\n");
      
      const message = `*NEW ORDER: ${orderReference}*

*Customer Details:*
Name: ${name}
Phone: ${phone}
City: ${city}

*Order Items:*
${itemsList}

*Summary:*
Subtotal: ${formatKES(sub)}
Delivery: ${delivery === 0 ? "FREE" : formatKES(delivery)}
*Total: ${formatKES(total)}*

Please confirm availability and delivery. Thank you!`;
      
      const whatsappUrl = `https://wa.me/${COMPANY_CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
      
      // Clear cart
      clear();
      
      // Open WhatsApp
      window.open(whatsappUrl, "_blank");
      
      // Redirect to success page
      router.push(`/order-success?ref=${orderReference}`);
    } catch (err: any) {
      console.error("Order error:", err);
      setError(err.message || "Failed to create order. Please try again or contact us via WhatsApp.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-8 md:py-12">
      <h1 className="font-display font-bold text-3xl">Checkout</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Complete your order via WhatsApp — fast, secure, and convenient.
      </p>
      
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive text-destructive px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* WhatsApp Order Section */}
          <section className="rounded-2xl border-2 border-brand-green-500/30 bg-gradient-to-br from-brand-green-50 to-white dark:from-brand-green-950/20 dark:to-background p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-full bg-brand-green-500 flex items-center justify-center shrink-0">
                <MessageCircle className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">Order via WhatsApp</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Enter your details below, then we'll send your order to our team via WhatsApp.
                </p>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0712345678"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City/Town *</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Nairobi, Mombasa, Kisumu"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Delivery: Nairobi KES 200 · Major towns KES 300 · Other areas KES 350
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={handleWhatsAppOrder}
                  variant="default"
                  size="lg"
                  className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
                  disabled={loading}
                >
                  <MessageCircle className="size-5" />
                  {loading ? "Creating order..." : "Order on WhatsApp"}
                </Button>
              </div>
            </div>
          </section>

          {/* Payment Methods - Coming Soon */}
          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-semibold text-lg">Online Payment</h2>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 text-xs font-medium">
                <Clock className="size-3" />
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              We're working on integrating secure online payment options. For now, please use WhatsApp to complete your order.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {methods.map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.id}
                    className="text-left rounded-xl border p-4 opacity-60 cursor-not-allowed bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-sm">{m.label}</p>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-brand-green-500" />
              All payments will be processed securely when available.
            </p>
          </section>
        </div>

        {/* Order Summary */}
        <aside className="sticky top-24 self-start">
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <h2 className="font-semibold">Your order</h2>
            <ul className="divide-y max-h-[400px] overflow-y-auto">
              {lines.map((l) => (
                <li key={l.product_id} className="flex gap-3 py-3">
                  <div className="relative size-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    {l.image && (
                      <Image
                        src={l.image}
                        alt={l.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{l.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {l.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {formatKES(l.unit_price * l.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 text-sm border-t pt-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatKES(sub)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd>{delivery === 0 ? "Free" : formatKES(delivery)}</dd>
              </div>
              {sub >= FREE_DELIVERY_OVER_KES && (
                <p className="text-xs text-brand-green-600 font-medium">
                  You qualify for free delivery!
                </p>
              )}
              {sub < FREE_DELIVERY_OVER_KES && delivery > 0 && (
                <p className="text-xs text-muted-foreground">
                  Free delivery on orders over {formatKES(FREE_DELIVERY_OVER_KES)}
                </p>
              )}
              <div className="flex justify-between text-base pt-2 border-t">
                <dt className="font-semibold">Total</dt>
                <dd className="font-bold">{formatKES(total)}</dd>
              </div>
            </dl>
            <Button
              onClick={handleWhatsAppOrder}
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              <MessageCircle className="size-5" />
              {loading ? "Creating..." : `Complete Order · ${formatKES(total)}`}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              You'll be redirected to WhatsApp
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
