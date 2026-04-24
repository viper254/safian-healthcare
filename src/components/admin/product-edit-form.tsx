"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Image from "next/image";

interface Category {
  id: string;
  slug: string;
  name: string;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sort_order: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string | null;
  brand: string | null;
  sku: string | null;
  category_id: string | null;
  original_price: number;
  discounted_price: number | null;
  offer_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_featured: boolean;
  is_active: boolean;
  category?: { id: string; name: string; slug: string } | null;
  images?: ProductImage[];
}

export function ProductEditForm({ product }: { product: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>(product.images || []);

  // Form state
  const [formData, setFormData] = useState({
    name: product.name,
    slug: product.slug,
    description: product.description,
    short_description: product.short_description || "",
    brand: product.brand || "",
    sku: product.sku || "",
    category_id: product.category_id || "",
    original_price: product.original_price.toString(),
    discounted_price: product.discounted_price?.toString() || "",
    offer_price: product.offer_price?.toString() || "",
    stock_quantity: product.stock_quantity.toString(),
    low_stock_threshold: product.low_stock_threshold.toString(),
    is_featured: product.is_featured,
    is_active: product.is_active,
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
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function removeExistingImage(imageId: string) {
    if (!confirm("Delete this image?")) return;
    
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from("product_images")
        .delete()
        .eq("id", imageId);
      
      if (error) throw error;
      
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        short_description: formData.short_description.trim() || null,
        brand: formData.brand.trim() || null,
        sku: formData.sku.trim() || null,
        category_id: formData.category_id || null,
        original_price: parseFloat(formData.original_price),
        discounted_price: formData.discounted_price ? parseFloat(formData.discounted_price) : null,
        offer_price: formData.offer_price ? parseFloat(formData.offer_price) : null,
        stock_quantity: parseInt(formData.stock_quantity),
        low_stock_threshold: parseInt(formData.low_stock_threshold),
        is_featured: formData.is_featured,
        is_active: formData.is_active,
      };

      // Update product via API
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update product");
      }

      // Handle new image uploads if any
      if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
        const supabase = createSupabaseBrowserClient();
        const files = Array.from(fileInputRef.current.files);
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${product.id}/${Date.now()}-${i}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(fileName, file);

          if (uploadError) {
            console.error("Upload error:", uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);

          await supabase.from("product_images").insert({
            product_id: product.id,
            url: publicUrl,
            alt: formData.name,
            sort_order: existingImages.length + i,
          });
        }
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      console.error("Error:", err);
      setError(err?.message || "Failed to update product");
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
          />
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
            />
          </div>

          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
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
            />
          </div>
        </div>

        {/* Offer Price */}
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
            />
          </div>
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <Label>Current Images</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {existingImages.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border">
                  <Image src={img.url} alt={img.alt || ""} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images */}
        <div>
          <Label htmlFor="images">Add New Images</Label>
          <Input
            id="images"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="cursor-pointer"
          />

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
          {loading ? "Saving..." : "Save Changes"}
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
