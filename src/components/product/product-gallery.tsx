"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: { url: string; alt?: string | null }[];
  name: string;
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const primary = images[selectedIndex] || images[0];
  
  if (images.length === 0) {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted ring-1 ring-black/5 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">No image available</p>
      </div>
    );
  }

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
    if (e.key === "Escape") setIsLightboxOpen(false);
  };
  
  return (
    <>
      <div>
        {/* Main Image - Clickable */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="relative aspect-square rounded-2xl overflow-hidden bg-muted ring-1 ring-black/5 w-full cursor-zoom-in hover:opacity-95 transition-opacity"
        >
          <Image
            src={primary.url}
            alt={primary.alt ?? name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-cover"
            unoptimized={primary.url.includes('supabase.co')}
          />
        </button>

        {/* Thumbnail Grid */}
        {images.length > 1 && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedIndex(i)}
                className={`relative aspect-square rounded-lg overflow-hidden border bg-muted transition-all ${
                  i === selectedIndex
                    ? "ring-2 ring-primary border-primary"
                    : "hover:border-primary/50"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt ?? `${name} ${i + 1}`}
                  fill
                  sizes="100px"
                  className="object-cover"
                  loading="lazy"
                  unoptimized={img.url.includes('supabase.co')}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 size-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Close"
          >
            <X className="size-6" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium">
            {selectedIndex + 1} / {images.length}
          </div>

          {/* Main Image Container */}
          <div
            className="relative w-full h-full max-w-6xl max-h-[85vh] mx-auto flex items-center justify-center px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selectedIndex].url}
              alt={images[selectedIndex].alt ?? name}
              fill
              sizes="100vw"
              className="object-contain"
              priority
              unoptimized={images[selectedIndex].url.includes('supabase.co')}
            />
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 size-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-8" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 size-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="size-8" />
              </button>
            </>
          )}

          {/* Thumbnail Strip at Bottom */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-black/50 p-3 rounded-lg max-w-[90vw] overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(i);
                  }}
                  className={`relative size-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    i === selectedIndex
                      ? "border-white scale-110"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? `${name} ${i + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized={img.url.includes('supabase.co')}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
