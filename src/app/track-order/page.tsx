"use client";

import React, { useState } from "react";
import { Search, Package, CheckCircle2, Truck, Clock, CircleAlert, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatKES } from "@/lib/utils";
import { COMPANY_CONTACT } from "@/lib/constants";
import type { OrderStatus } from "@/types";

const statusMeta: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive"; icon: typeof Package }
> = {
  pending: { label: "Pending", variant: "warning", icon: Clock },
  confirmed: { label: "Confirmed", variant: "secondary", icon: CheckCircle2 },
  processing: { label: "Processing", variant: "secondary", icon: Package },
  dispatched: { label: "On the Way", variant: "default", icon: Truck },
  delivered: { label: "Delivered", variant: "success", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", variant: "destructive", icon: CircleAlert },
};

export default function TrackOrderPage() {
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    if (!reference.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/track?ref=${encodeURIComponent(reference)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Order not found");
      }

      setOrder(data);
    } catch (err: any) {
      setError(err.message || "Failed to track order");
    } finally {
      setLoading(false);
    }
  }

  function handleWhatsAppSupport() {
    const message = reference 
      ? `Hi, I need help with my order ${reference}`
      : "Hi, I need help tracking my order";
    const whatsappUrl = `https://wa.me/${COMPANY_CONTACT.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  }

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-brand-blue-600 to-brand-blue-800 text-white py-20">
      <div className="container max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold mb-3">Track Your Order</h1>
          <p className="text-blue-100">
            Enter your order reference number to see the latest status.
          </p>
        </div>

        <form onSubmit={handleTrack} className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
              Order Reference Number
            </label>
            <div className="flex gap-3">
              <Input
                id="reference"
                type="text"
                placeholder="e.g., SAF-M0CT0DAL-RG9R"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
                className="flex-1 h-12 text-base"
              />
              <Button
                type="submit"
                disabled={loading}
                className="h-12 px-8 bg-brand-gradient hover:opacity-90"
              >
                {loading ? (
                  "Tracking..."
                ) : (
                  <>
                    <Search className="size-5" />
                    Track
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-1">
              Please check your reference number or contact support.
            </p>
          </div>
        )}

        {order && (
          <div className="bg-white text-gray-900 rounded-2xl p-6 shadow-xl space-y-6">
            {/* Status */}
            <div className="text-center pb-6 border-b">
              <Badge 
                variant={statusMeta[order.status as OrderStatus].variant} 
                className="text-lg px-6 py-3"
              >
                {React.createElement(statusMeta[order.status as OrderStatus].icon, { className: "size-5 mr-2" })}
                {statusMeta[order.status as OrderStatus].label}
              </Badge>
              <p className="text-sm text-muted-foreground mt-3">
                Order placed on {formatDateTime(order.created_at)}
              </p>
            </div>

            {/* Order Details */}
            <div>
              <h3 className="font-semibold mb-3">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-medium">{order.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer:</span>
                  <span className="font-medium">{order.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold">{formatKES(order.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment:</span>
                  <Badge variant={order.payment_status === "paid" ? "success" : "warning"} className="capitalize">
                    {order.payment_status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <h3 className="font-semibold mb-2">Delivery Address</h3>
              <p className="text-sm text-muted-foreground">
                {order.shipping_address}, {order.shipping_city}
              </p>
            </div>

            {/* Items */}
            {order.items && order.items.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Items ({order.items.length})</h3>
                <div className="space-y-2">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product_name} × {item.quantity}
                      </span>
                      <span className="font-medium">{formatKES(item.unit_price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp Support */}
            <Button
              onClick={handleWhatsAppSupport}
              variant="default"
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white"
            >
              <MessageCircle className="size-5" />
              WhatsApp Support
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
