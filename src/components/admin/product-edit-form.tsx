"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Trash2, Upload, ImageIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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
  
  // State for images
  const [existingImages, setExistingImages] = useState<ProductImage[]>(product.images || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

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

  // Handle clipboard paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setNewFiles(prev => [...prev, file]);
            setPreviews(prev => [...prev, URL.createObjectURL(file)]);
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
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
    if (files.length === 0) return;

    setNewFiles(prev => [...prev, ...files]);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...urls]);
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeNewImage(index: number) {
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function removeExistingImage(imageId: string) {
    if (!confirm("Delete this image permanently?")) return;
    
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
      alert("Failed to delete image");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();

      // 1. Update product basic info
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

      const { error: updateError } = await supabase
        .from("products")
        .update(productData)
        .eq("id", product.id);

      if (updateError) throw updateError;

      // 2. Upload and save new images
      if (newFiles.length > 0) {
        for (let i = 0; i < newFiles.length; i++) {
          const file = newFiles[i];
          const fileExt = file.name.split(".").pop() || "png";
          const fileName = `${product.id}/${Date.now()}-${i}.${fileExt}`;

          if (fileName.includes('..')) throw new Error("Invalid file name");

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
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 text-destructive p-4 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold">Basic Information</h2>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" name="name" required value={formData.name} onChange={handleChange} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input id="slug" name="slug" required value={formData.slug} onChange={handleChange} />
                </div>
                <div className="space-y-2">
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
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Input id="short_description" name="short_description" value={formData.short_description} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Full Description *</Label>
                <Textarea id="description" name="description" required value={formData.description} onChange={handleChange} rows={6} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold">Product Media</h2>
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/20 rounded-2xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="size-6 text-primary" />
                  </div>
                  <p className="font-bold">Click to upload or paste images</p>
                  <p className="text-xs text-muted-foreground">Supports PNG, JPG, WEBP (Max 5MB)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* Existing Images */}
                {existingImages.map((img, i) => (
                  <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border bg-muted">
                    <Image src={img.url} alt={img.alt || ""} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="size-8 rounded-full bg-destructive text-white flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    {i === 0 && (
                      <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Main
                      </span>
                    )}
                  </div>
                ))}

                {/* New Previews */}
                {previews.map((url, i) => (
                  <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border bg-muted ring-2 ring-primary/20">
                    <img src={url} alt="New preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="size-8 rounded-full bg-destructive text-white flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <span className="absolute top-2 left-2 bg-brand-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      New
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold">Pricing & Inventory</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="original_price">Original Price (KES) *</Label>
                <Input id="original_price" name="original_price" type="number" step="0.01" required value={formData.original_price} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discounted_price">Discounted Price (KES)</Label>
                <Input id="discounted_price" name="discounted_price" type="number" step="0.01" value={formData.discounted_price} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                <Input id="stock_quantity" name="stock_quantity" type="number" required value={formData.stock_quantity} onChange={handleChange} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold">Visibility</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="size-4 rounded border-input accent-primary" />
                <div className="space-y-0.5">
                  <p className="text-sm font-bold">Active</p>
                  <p className="text-xs text-muted-foreground">Visible to customers</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="size-4 rounded border-input accent-primary" />
                <div className="space-y-0.5">
                  <p className="text-sm font-bold">Featured</p>
                  <p className="text-xs text-muted-foreground">Show on homepage</p>
                </div>
              </label>
            </div>
          </section>

          <div className="flex flex-col gap-3">
            <Button type="submit" size="lg" variant="gradient" className="w-full h-12" disabled={loading}>
              {loading ? "Saving Changes..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" className="w-full h-12" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
