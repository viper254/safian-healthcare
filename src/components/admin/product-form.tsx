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

interface ImageFile {
  file: File;
  preview: string;
}

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageFile[]>([]);

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

  // Handle clipboard paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const newImages: ImageFile[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            newImages.push({
              file,
              preview: URL.createObjectURL(file)
            });
          }
        }
      }

      if (newImages.length > 0) {
        setImages(prev => [...prev, ...newImages]);
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
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
    
    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(images[index].preview);
    setImages(prev => prev.filter((_, i) => i !== index));
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
        short_description: formData.short_description.trim(),
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

      // Create product via API
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create product");
      }

      const product = result;

      // Handle image uploads if any
      if (images.length > 0) {
        const supabase = createSupabaseBrowserClient();
        
        for (let i = 0; i < images.length; i++) {
          const { file } = images[i];
          const fileExt = file.name.split(".").pop() || "png";
          const fileName = `${product.id}/${Date.now()}-${i}.${fileExt}`;

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(fileName, file);

          if (uploadError) {
            console.error("Upload error:", uploadError);
            setError(`Image upload failed: ${uploadError.message}. Please ensure the 'product-images' storage bucket exists in Supabase.`);
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
    } catch (err: any) {
      console.error("Error:", err);
      setError(err?.message || "Failed to create product");
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
              placeholder="Special offer price"
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
          <div 
            className="mt-1 border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 transition-colors hover:border-primary/50 group"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files);
              const newImages = files.filter(f => f.type.startsWith("image/")).map(file => ({
                file,
                preview: URL.createObjectURL(file)
              }));
              setImages(prev => [...prev, ...newImages]);
            }}
          >
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              </div>
              <div className="text-sm">
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary font-semibold hover:underline"
                >
                  Click to upload
                </button>
                {" "}or drag and drop
              </div>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF up to 10MB. <span className="font-medium text-primary">Pro tip: You can also paste images directly!</span>
              </p>
            </div>
            <input
              id="images"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border bg-muted group">
                  <img src={img.preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="bg-destructive text-destructive-foreground rounded-full p-2 hover:scale-110 transition-transform"
                      title="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                    {i === 0 ? "Main" : `Image ${i + 1}`}
                  </div>
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

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="px-8">
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
