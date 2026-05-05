"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pencil, Save, X, Trash2, Upload } from "lucide-react";
import type { Category } from "@/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface CategoryEditCardProps {
  category: Category;
  productCount: number;
}

export function CategoryEditCard({ category, productCount }: CategoryEditCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description || "",
    image_url: category.image_url || "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    setError("");

    try {
      const supabase = createSupabaseBrowserClient();
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `category-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    setFormData(prev => ({ ...prev, image_url: "" }));
  }

  async function handleSave() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update category");
      }

      setIsEditing(false);
      window.location.reload(); // Refresh to show updated data
    } catch (err) {
      console.error("Save error:", err);
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setFormData({
      name: category.name,
      description: category.description || "",
      image_url: category.image_url || "",
    });
    setIsEditing(false);
    setError("");
  }

  async function handleDelete() {
    if (productCount > 0) {
      setError(`Cannot delete category with ${productCount} products. Move or delete products first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete category");
      }

      window.location.reload();
    } catch (err) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  if (isEditing) {
    return (
      <div className="rounded-2xl border bg-card shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Edit Category</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Diagnostic Essentials"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of this category..."
            />
          </div>

          <div>
            <Label htmlFor="image_url">Category Image</Label>
            
            {!formData.image_url ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="cursor-pointer"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                  >
                    <Upload className="size-4" />
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload an image (max 5MB) or paste a URL below
                </p>
                <Input
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="Or paste image URL here..."
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                  <Image
                    src={formData.image_url}
                    alt="Category preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {formData.image_url}
                </p>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>

        <Button
          onClick={handleDelete}
          disabled={deleting || productCount > 0}
          variant="destructive"
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {deleting ? "Deleting..." : "Delete Category"}
        </Button>
        
        {productCount > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Cannot delete: {productCount} product{productCount !== 1 ? 's' : ''} in this category
          </p>
        )}
      </div>
    );
  }

  return (
    <article className="relative overflow-hidden rounded-2xl border bg-card shadow-sm group">
      <div className="relative aspect-[4/3]">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            sizes="(max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No image</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <p className="text-[10px] uppercase tracking-wider opacity-80">
            {productCount} products
          </p>
          <h3 className="font-semibold text-lg drop-shadow-sm">{category.name}</h3>
        </div>
        
        {/* Edit button overlay */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </div>
      
      <div className="p-4 text-sm text-muted-foreground">
        {category.description || "No description"}
      </div>
    </article>
  );
}
