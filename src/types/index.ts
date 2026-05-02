export type CategorySlug =
  | "medical-students"
  | "doctors-and-professionals"
  | "facilities-hospitals-clinics"
  | "general-public-patients-hbc"
  | "diagnostic-essentials"
  | "procedure-practical-kits"
  | "medical-wear-protective-gear"
  | "clinical-academic-support-tools"
  | "home-care-patient-support-devices";

export interface Category {
  id: string;
  slug: CategorySlug | string;
  name: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface ProductImage {
  url: string;
  alt?: string | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  short_description: string | null;
  category_id: string;
  category?: Category;
  original_price: number;
  discounted_price: number | null;
  offer_price: number | null;
  offer_expires_at: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_featured: boolean;
  is_active: boolean;
  sku: string | null;
  brand: string | null;
  tags: string[];
  images: ProductImage[];
  specs: Record<string, string>;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface CartLine {
  product_id: string;
  slug: string;
  name: string;
  category_slug: string;
  unit_price: number;
  price_type: "offer" | "discounted" | "regular";
  quantity: number;
  image: string;
  stock: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "dispatched"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";

export type PaymentMethod = "mpesa" | "till" | "card" | "cash_on_delivery" | "bank_transfer";

export interface Order {
  id: string;
  reference: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_ref: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type:
    | "page_view"
    | "product_view"
    | "add_to_cart"
    | "checkout_started"
    | "order_placed";
  user_id: string | null;
  product_id: string | null;
  path: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}
