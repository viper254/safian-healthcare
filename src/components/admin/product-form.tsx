"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  slug: string;
  name: string;
}

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    brand: "",
    sku: "",
    category_id: "",
    original_price: "",
    discounted_price: "",
    offer_price: "",
    offer_expires_at: "",
    stock_quantity: "",
    low_stock_threshold: "5",
    is_featured: false,
    is_active: true,
  });

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("categories")
        .select("id, slug, name")
        .order("sort_order");
      
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && !productId) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, productId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...urls]);
  }

  function removePreview(index: number) {
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();

      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        short_description: formData.short_description.trim(),
        brand: formData.brand.trim() || null,
        sku: formData.sku.trim() || null,
        category_id: formData.category_id || null,
        original_price: parseFloat(formData.original_price),
        discounted_price: formData.discounted_price ? parseFloat(formData.discounted_price) : null,
        offer_price: formData.offer_price ? parseFloat(formData.offer_price) : null,
        offer_expires_at: formData.offer_expires_at || null,
        stock_quantity: parseInt(formData.stock_quantity),
        low_stock_threshold: parseInt(formData.low_stock_threshold),
        is_featured: formData.is_featured,
        is_active: formData.is_active,
      };

      // Insert or update product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert(productData)
        .select()
        .single();

      if (productError) throw productError;

      // Handle image uploads if any
      if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
        const files = Array.from(fileInputRef.current.files);
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${product.id}/${Date.now()}-${i}.${fileExt}`;

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(fileName, file);

          if (uploadError) {
            console.error("Upload error:", uploadError);
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);

          // Insert product_images record
          await supabase.from("product_images").insert({
            product_id: product.id,
            url: publicUrl,
            alt: formData.name,
            sort_order: i,
          });
        }
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Littmann Classic III Stethoscope"
          />
        </div>

        {/* Slug */}
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            name="slug"
            required
            value={formData.slug}
            onChange={handleChange}
            placeholder="e.g., littmann-classic-iii-stethoscope"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Auto-generated from name (lowercase, hyphens, no spaces)
          </p>
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category_id">Category *</Label>
          <select
            id="category_id"
            name="category_id"
            required
            value={formData.category_id}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Short Description */}
        <div>
          <Label htmlFor="short_description">Short Description</Label>
          <Input
            id="short_description"
            name="short_description"
            value={formData.short_description}
            onChange={handleChange}
            placeholder="Brief one-line description"
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Full Description *</Label>
          <Textarea
            id="description"
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Detailed product description..."
          />
        </div>

        {/* Brand & SKU */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g., 3M Littmann"
            />
          </div>

          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g., LITT-C3-BLK"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="original_price">Original Price (KES) *</Label>
            <Input
              id="original_price"
              name="original_price"
              type="number"
              step="0.01"
              required
              value={formData.original_price}
              onChange={handleChange}
              placeholder="8500"
            />
          </div>

          <div>
            <Label htmlFor="discounted_price">Discounted Price (KES)</Label>
            <Input
              id="discounted_price"
              name="discounted_price"
              type="number"
              step="0.01"
              value={formData.discounted_price}
              onChange={handleChange}
              placeholder="Leave blank if no discount"
            />
          </div>
        </div>

        {/* Offer Price & Expiry */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="offer_price">Offer Price (KES)</Label>
            <Input
              id="offer_price"
              name="offer_price"
              type="number"
              step="0.01"
              value={formData.offer_price}
              onChange={handleChange}
              placeholder="Special offer price"
            />
          </div>

          <div>
            <Label htmlFor="offer_expires_at">Offer Expires At</Label>
            <Input
              id="offer_expires_at"
              name="offer_expires_at"
              type="datetime-local"
              value={formData.offer_expires_at}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stock_quantity">Stock Quantity *</Label>
            <Input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              required
              value={formData.stock_quantity}
              onChange={handleChange}
              placeholder="25"
            />
          </div>

          <div>
            <Label htmlFor="low_stock_threshold">Low Stock Warning</Label>
            <Input
              id="low_stock_threshold"
              name="low_stock_threshold"
              type="number"
              value={formData.low_stock_threshold}
              onChange={handleChange}
              placeholder="5"
            />
          </div>
        </div>

        {/* Images */}
        <div>
          <Label htmlFor="images">Product Images</Label>
          <Input
            id="images"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Upload product images (multiple allowed)
          </p>

          {/* Image Previews */}
          {previews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {previews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                  <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePreview(i)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkboxes */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_featured"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="size-4 rounded border-input"
            />
            <Label htmlFor="is_featured" className="cursor-pointer">
              Feature this product on homepage
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="size-4 rounded border-input"
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Product is active (visible to customers)
            </Label>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Product"}
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
