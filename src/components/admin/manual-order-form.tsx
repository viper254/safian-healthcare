"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Plus, X } from "lucide-react";
import { formatKES } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  original_price: number;
  stock_quantity: number;
}

interface OrderLine {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export function ManualOrderForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    shipping_city: "",
    shipping_notes: "",
    payment_method: "mpesa_till" as const,
    payment_status: "unpaid" as const,
    status: "pending" as const,
    delivery_fee: "350",
  });

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("products")
        .select("id, name, original_price, stock_quantity")
        .eq("is_active", true)
        .order("name");
      
      if (data) setProducts(data);
    }
    fetchProducts();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function addLine() {
    setLines(prev => [...prev, {
      product_id: "",
      product_name: "",
      quantity: 1,
      unit_price: 0,
    }]);
  }

  function removeLine(index: number) {
    setLines(prev => prev.filter((_, i) => i !== index));
  }

  function updateLine(index: number, field: keyof OrderLine, value: any) {
    setLines(prev => prev.map((line, i) => {
      if (i !== index) return line;
      
      if (field === "product_id") {
        const product = products.find(p => p.id === value);
        if (product) {
          return {
            ...line,
            product_id: value,
            product_name: product.name,
            unit_price: product.original_price,
          };
        }
      }
      
      return { ...line, [field]: value };
    }));
  }

  const subtotal = lines.reduce((sum, line) => sum + (line.unit_price * line.quantity), 0);
  const deliveryFee = parseFloat(formData.delivery_fee) || 0;
  const total = subtotal + deliveryFee;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (lines.length === 0) {
      setError("Please add at least one product");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();
      
      // Generate reference
      const reference = `SAF-${Date.now().toString(36).toUpperCase()}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          reference,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone,
          shipping_address: formData.shipping_address,
          shipping_city: formData.shipping_city,
          shipping_notes: formData.shipping_notes || null,
          payment_method: formData.payment_method,
          payment_status: formData.payment_status,
          status: formData.status,
          subtotal,
          delivery_fee: deliveryFee,
          total,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = lines.map(line => ({
        order_id: order.id,
        product_id: line.product_id,
        product_name: line.product_name,
        quantity: line.quantity,
        unit_price: line.unit_price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      router.push("/admin/orders");
      router.refresh();
    } catch (err: any) {
      console.error("Error:", err);
      setError(err?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Customer Details */}
      <section className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="font-semibold">Customer Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customer_name">Full Name *</Label>
            <Input
              id="customer_name"
              name="customer_name"
              required
              value={formData.customer_name}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="customer_phone">Phone *</Label>
            <Input
              id="customer_phone"
              name="customer_phone"
              type="tel"
              required
              value={formData.customer_phone}
              onChange={handleChange}
              placeholder="+254 7..."
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="customer_email">Email</Label>
            <Input
              id="customer_email"
              name="customer_email"
              type="email"
              value={formData.customer_email}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      {/* Shipping Details */}
      <section className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="font-semibold">Shipping Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="shipping_address">Address *</Label>
            <Input
              id="shipping_address"
              name="shipping_address"
              required
              value={formData.shipping_address}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="shipping_city">City *</Label>
            <Input
              id="shipping_city"
              name="shipping_city"
              required
              value={formData.shipping_city}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="delivery_fee">Delivery Fee (KES)</Label>
            <Input
              id="delivery_fee"
              name="delivery_fee"
              type="number"
              step="0.01"
              value={formData.delivery_fee}
              onChange={handleChange}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="shipping_notes">Notes</Label>
            <Textarea
              id="shipping_notes"
              name="shipping_notes"
              value={formData.shipping_notes}
              onChange={handleChange}
              rows={2}
            />
          </div>
        </div>
      </section>

      {/* Order Items */}
      <section className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Order Items</h3>
          <Button type="button" onClick={addLine} size="sm" variant="outline">
            <Plus className="size-4" />
            Add Item
          </Button>
        </div>

        {lines.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No items added. Click "Add Item" to start.
          </p>
        ) : (
          <div className="space-y-3">
            {lines.map((line, index) => (
              <div key={index} className="flex gap-3 items-start p-3 rounded-lg border bg-muted/30">
                <div className="flex-1 grid sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Product</Label>
                    <select
                      value={line.product_id}
                      onChange={(e) => updateLine(index, "product_id", e.target.value)}
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                    >
                      <option value="">Select product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {formatKES(p.original_price)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => updateLine(index, "quantity", parseInt(e.target.value))}
                      required
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Unit Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={line.unit_price}
                      onChange={(e) => updateLine(index, "unit_price", parseFloat(e.target.value))}
                      required
                      className="h-9"
                    />
                  </div>
                </div>
                <div className="pt-6">
                  <Button
                    type="button"
                    onClick={() => removeLine(index)}
                    size="icon"
                    variant="ghost"
                    className="size-9"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Summary */}
        {lines.length > 0 && (
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-semibold">{formatKES(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery:</span>
              <span className="font-semibold">{formatKES(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t">
              <span className="font-semibold">Total:</span>
              <span className="font-bold">{formatKES(total)}</span>
            </div>
          </div>
        )}
      </section>

      {/* Order Status */}
      <section className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="font-semibold">Order Status</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="status">Order Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <Label htmlFor="payment_status">Payment Status</Label>
            <select
              id="payment_status"
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <Label htmlFor="payment_method">Payment Method</Label>
            <select
              id="payment_method"
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="mpesa">M-Pesa</option>
              <option value="cash_on_delivery">Cash on Delivery</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading || lines.length === 0}>
          {loading ? "Creating..." : "Create Order"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
