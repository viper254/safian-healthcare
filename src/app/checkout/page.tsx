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
  UserPlus,
  Info,
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    }
    checkAuth();
  }, []);

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

  // Require authentication to place orders
  if (isAuthenticated === false) {
    return (
      <div className="container py-20">
        <div className="max-w-md mx-auto">
          <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
            <div className="inline-flex size-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-6">
              <UserPlus className="size-8" />
            </div>
            
            <h1 className="font-display font-bold text-2xl mb-3">Account Required</h1>
            
            <p className="text-muted-foreground mb-8">
              You need an account to place orders and track your deliveries.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                asChild
                size="lg"
                variant="gradient"
              >
                <Link href="/register?redirect=/checkout">
                  Create Account
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
              >
                <Link href="/login?redirect=/checkout">
                  Sign In
                </Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Already have an account? <Link href="/login?redirect=/checkout" className="text-blue-600 hover:underline">Sign in here</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="container py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green-600"></div>
        <p className="mt-4 text-muted-foreground">Loading checkout...</p>
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
          payment_method: "till",
          payment_status: "unpaid",
          status: "pending",
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Order creation failed:", data);
        
        // Handle specific error cases with helpful messages
        if (response.status === 401 || response.status === 403) {
          setError("Authentication required. Please sign in or create an account to place orders.");
          setLoading(false);
          setIsAuthenticated(false); // Show the auth banner
          return;
        }
        
        if (response.status === 400) {
          const errorMsg = data.error || data.details?.[0]?.message || "Please check your order details and try again";
          throw new Error(errorMsg);
        }
        
        if (response.status === 500) {
          throw new Error("Server error. Please try again or contact us via WhatsApp.");
        }
        
        throw new Error(data.error || "Failed to create order. Please try again.");
      }

      if (!data.reference) {
        throw new Error("No order reference received");
      }

      const orderReference = data.reference;
      
      // Prepare WhatsApp message with order details
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

PLEASE CONFIRM AVAILABILITY AND DELIVERY`;
      
      const whatsappUrl = `https://wa.me/${COMPANY_CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
      
      // Clear cart
      clear();
      
      // Open WhatsApp
      window.open(whatsappUrl, "_blank");
      
      // Redirect to success page
      router.push(`/order-success?ref=${orderReference}`);
    } catch (err: any) {
      console.error("Order error:", err);
      
      // Provide user-friendly error messages
      let errorMessage = "";
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.code === 'PGRST116') {
        errorMessage = "One or more products are no longer available. Please check your cart.";
      } else if (err.code === '23505') {
        errorMessage = "This order already exists. Please refresh the page and try again.";
      } else if (err.code === '42501') {
        errorMessage = "Permission denied. Please sign in or create an account to place orders.";
        setIsAuthenticated(false); // Show auth banner
      } else if (err.code === 'PGRST301') {
        errorMessage = "Database connection error. Please try again in a moment.";
      } else {
        errorMessage = "Failed to create order. Please try again or contact us via WhatsApp at " + COMPANY_CONTACT.phoneFormatted;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-8 md:py-12">
      <h1 className="font-display font-bold text-3xl">Checkout</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Pay via M-Pesa Till Number {COMPANY_CONTACT.tillNumber} and confirm via WhatsApp.
      </p>
      
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive px-4 py-3">
              <div className="flex items-start gap-3">
                <svg className="size-5 text-destructive shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-destructive text-sm mb-1">Order Failed</p>
                  <p className="text-sm text-destructive/90">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Till Number Payment Section */}
          <section className="rounded-2xl border-2 border-brand-green-500/30 bg-gradient-to-br from-brand-green-50 to-white dark:from-brand-green-950/20 dark:to-background p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-full bg-brand-green-500 flex items-center justify-center shrink-0">
                <Smartphone className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">Pay via M-Pesa Till</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Enter your details below, then pay to our M-Pesa Till Number and send confirmation via WhatsApp.
                </p>
                
                {/* Till Number Display */}
                <div className="mb-4 p-4 rounded-lg bg-white dark:bg-background border-2 border-brand-green-500">
                  <p className="text-xs text-muted-foreground mb-1">M-Pesa Till Number</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-brand-green-600">{COMPANY_CONTACT.tillNumber}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(COMPANY_CONTACT.tillNumber);
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    SAFIAN SUPPLIES
                  </p>
                </div>
                
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
                  {loading ? "Creating order..." : "Send Order via WhatsApp"}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  After payment, send M-Pesa confirmation message via WhatsApp
                </p>
              </div>
            </div>
          </section>

          {/* Payment Methods - Coming Soon */}
          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-semibold text-lg">Payment Method</h2>
            </div>
            <div className="rounded-xl border-2 border-brand-green-500 bg-brand-green-50 dark:bg-brand-green-950/20 p-6">
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-xl bg-brand-green-500 text-white flex items-center justify-center shrink-0">
                  <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Lipa na M-PESA</h3>
                  <div className="space-y-3 text-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-brand-green-500">
                      <p className="text-xs text-muted-foreground mb-1">Buy Goods Till Number</p>
                      <p className="text-2xl font-bold text-brand-green-600 dark:text-brand-green-400 tracking-wider">5517358</p>
                      <p className="text-xs text-muted-foreground mt-1">SAFIAN SUPPLIES</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-brand-green-700 dark:text-brand-green-300">Payment Instructions:</p>
                      <ol className="space-y-1.5 text-sm">
                        <li className="flex gap-2">
                          <span className="font-bold text-brand-green-600 dark:text-brand-green-400">1.</span>
                          <span>Go to M-PESA menu on your phone</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-brand-green-600 dark:text-brand-green-400">2.</span>
                          <span>Select <strong>Lipa na M-PESA</strong></span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-brand-green-600 dark:text-brand-green-400">3.</span>
                          <span>Select <strong>Buy Goods and Services</strong></span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-brand-green-600 dark:text-brand-green-400">4.</span>
                          <span>Enter Till Number: <strong className="text-brand-green-600 dark:text-brand-green-400">5517358</strong></span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-brand-green-600 dark:text-brand-green-400">5.</span>
                          <span>Enter amount: <strong className="text-brand-green-600 dark:text-brand-green-400">{formatKES(total)}</strong></span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-brand-green-600 dark:text-brand-green-400">6.</span>
                          <span>Enter your M-PESA PIN and confirm</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-brand-green-600 dark:text-brand-green-400">7.</span>
                          <span>You will receive a confirmation SMS</span>
                        </li>
                      </ol>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">After Payment:</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Send the M-PESA confirmation message to <strong>0756 597 813</strong> via WhatsApp or SMS with your order details.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-brand-green-500" />
              Secure M-PESA payment. Your order will be processed once payment is confirmed.
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
