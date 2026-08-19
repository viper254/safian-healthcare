"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Smartphone, MessageCircle, UserPlus } from "lucide-react";
import { useCart } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatKES } from "@/lib/utils";
import { FREE_DELIVERY_OVER_KES, COMPANY_CONTACT } from "@/lib/constants";
import { calculateDeliveryFee, normalizeKenyanPhone } from "@/lib/checkout";

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

  async function handleMpesaPayment() {
    if (!name.trim() || !phone.trim() || !city.trim()) {
      setError("Please enter your name, phone number, and city");
      return;
    }

    const normalizedPhone = normalizeKenyanPhone(phone);
    if (!normalizedPhone) {
      setError("Phone number must be 10 digits starting with 0 (e.g., 0712345678)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/payments/mpesa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: normalizedPhone.local,
          city: city.trim(),
          lines: lines.map((line) => ({
            product_id: line.product_id,
            quantity: line.quantity,
          })),
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "M-Pesa could not start the payment request.");
      }
      if (!data.reference) throw new Error("No order reference received.");

      clear();
      router.push(`/order-success?ref=${encodeURIComponent(data.reference)}&payment=mpesa`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "M-Pesa could not start the payment request. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleWhatsAppOrder() {
    if (!name.trim() || !phone.trim() || !city.trim()) {
      setError("Please enter your name, phone number, and city");
      return;
    }

    const normalizedPhone = normalizeKenyanPhone(phone);
    const formattedPhone = normalizedPhone?.local;
    if (!formattedPhone) {
      setError("Phone number must be 10 digits starting with 0 (e.g., 0712345678)");
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
          phone: formattedPhone,
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
        if (response.status === 429) {
          throw new Error(data.error || "Too many orders. Please try again later or contact support.");
        }
        
        if (response.status === 401 || response.status === 403) {
          setError("Authentication required. Please sign in or create an account to place orders.");
          setLoading(false);
          setIsAuthenticated(false); // Show the auth banner
          return;
        }
        
        if (response.status === 400) {
          // Show detailed validation errors
          if (data.details && Array.isArray(data.details)) {
            const errorMessages = data.details.map((issue: { path?: unknown; message?: unknown }) => {
              const field = Array.isArray(issue.path) ? issue.path.join('.') : 'field';
              const message = typeof issue.message === 'string' ? issue.message : 'Invalid field';
              return `${field}: ${message}`;
            }).join(', ');
            throw new Error(`Validation error: ${errorMessages}`);
          }
          const errorMsg = data.error || "Please check your order details and try again";
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
Phone: ${formattedPhone}
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
      router.push(`/order-success?ref=${encodeURIComponent(orderReference)}&payment=manual`);
    } catch (err: unknown) {
      console.error("Order error:", err);
      
      // Provide user-friendly error messages
      let errorMessage = "";
      const errorCode = err && typeof err === 'object' && 'code' in err ? (err as { code?: unknown }).code : undefined;
      const errorMessageFromError = err instanceof Error ? err.message : "";
      
      if (errorMessageFromError) {
        errorMessage = errorMessageFromError;
      } else if (errorCode === 'PGRST116') {
        errorMessage = "One or more products are no longer available. Please check your cart.";
      } else if (errorCode === '23505') {
        errorMessage = "This order already exists. Please refresh the page and try again.";
      } else if (errorCode === '42501') {
        errorMessage = "Permission denied. Please sign in or create an account to place orders.";
        setIsAuthenticated(false); // Show auth banner
      } else if (errorCode === 'PGRST301') {
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
        Pay securely with M-Pesa STK Push. You will receive a payment prompt on your phone.
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

          {/* M-Pesa STK Push Payment Section */}
          <section className="rounded-2xl border-2 border-brand-green-500/30 bg-gradient-to-br from-brand-green-50 to-white dark:from-brand-green-950/20 dark:to-background p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-full bg-brand-green-500 flex items-center justify-center shrink-0">
                <Smartphone className="size-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">Pay with M-Pesa</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Enter your details below. We will send an STK Push prompt to your phone so you can complete payment securely with your M-Pesa PIN.
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
                  onClick={handleMpesaPayment}
                  variant="default"
                  size="lg"
                  className="bg-brand-green-600 hover:bg-brand-green-700 text-white"
                  disabled={loading}
                >
                  <Smartphone className="size-5" />
                  {loading ? "Starting M-Pesa..." : "Pay with M-Pesa"}
                </Button>
                <Button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  variant="outline"
                  size="lg"
                  className="mt-3"
                  disabled={loading}
                >
                  <MessageCircle className="size-5" />
                  Use manual WhatsApp payment instead
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  A secure payment prompt will appear on the phone number above.
                </p>
              </div>
            </div>
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
              onClick={handleMpesaPayment}
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              <Smartphone className="size-5" />
              {loading ? "Starting M-Pesa..." : `Pay with M-Pesa · ${formatKES(total)}`}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              You will receive an M-Pesa payment prompt on your phone.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
