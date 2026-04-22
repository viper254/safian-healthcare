"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Search, SortAsc, X } from "lucide-react";
import type { Category, Product } from "@/types";
import { ProductCard } from "./product-card";
import { ProductListItem } from "./product-list-item";
import { ViewToggle, type ViewMode } from "./view-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { effectivePrice } from "@/lib/utils";

type Sort = "featured" | "price-asc" | "price-desc" | "newest" | "rating";

const SORT_LABEL: Record<Sort, string> = {
  featured: "Featured",
  "price-asc": "Price: low → high",
  "price-desc": "Price: high → low",
  newest: "Newest",
  rating: "Top rated",
};

export function ShopGrid({
  products,
  categories,
  activeCategorySlug,
  initialSearch = "",
}: {
  products: Product[];
  categories: Category[];
  activeCategorySlug?: string;
  initialSearch?: string;
}) {
  const [view, setView] = useState<ViewMode>("grid");
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState<Sort>("featured");
  const [brands, setBrands] = useState<string[]>([]);
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Persist preferred view in localStorage
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("safian-view") : null;
    if (saved === "grid" || saved === "list") setView(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("safian-view", view);
  }, [view]);

  const allBrands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.brand && set.add(p.brand));
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (brands.length) list = list.filter((p) => p.brand && brands.includes(p.brand));
    if (onlyOffers) {
      list = list.filter((p) => {
        const { type } = effectivePrice(p);
        return type !== "regular";
      });
    }
    if (inStockOnly) list = list.filter((p) => p.stock_quantity > 0);

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => effectivePrice(a).price - effectivePrice(b).price);
        break;
      case "price-desc":
        list.sort((a, b) => effectivePrice(b).price - effectivePrice(a).price);
        break;
      case "newest":
        list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
        break;
      case "rating":
        list.sort((a, b) => b.rating_avg - a.rating_avg);
        break;
      case "featured":
      default:
        list.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    }
    return list;
  }, [products, search, brands, onlyOffers, inStockOnly, sort]);

  const toggleBrand = (b: string) =>
    setBrands((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
    );
  const clearFilters = () => {
    setBrands([]);
    setOnlyOffers(false);
    setInStockOnly(false);
    setSearch("");
    setSort("featured");
  };
  const filterCount =
    brands.length + (onlyOffers ? 1 : 0) + (inStockOnly ? 1 : 0) + (search ? 1 : 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      {/* Sidebar filters — desktop */}
      <aside className="hidden lg:block sticky top-28 self-start">
        <FilterPanel
          allBrands={allBrands}
          brands={brands}
          toggleBrand={toggleBrand}
          onlyOffers={onlyOffers}
          setOnlyOffers={setOnlyOffers}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          clear={clearFilters}
          categories={categories}
          activeCategorySlug={activeCategorySlug}
        />
      </aside>

      {/* Main */}
      <div>
        {/* Toolbar */}
        <div className="sticky top-16 z-20 -mx-4 px-4 py-3 bg-background/90 backdrop-blur border-b">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                size="sm"
                variant="outline"
                className="lg:hidden"
                onClick={() => setFiltersOpen(true)}
              >
                <Filter className="size-4" />
                Filters
                {filterCount > 0 && (
                  <Badge variant="default" className="ml-1">
                    {filterCount}
                  </Badge>
                )}
              </Button>
              <label className="relative">
                <span className="sr-only">Sort</span>
                <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="h-10 rounded-full border border-input bg-background pl-9 pr-8 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none"
                >
                  {(Object.keys(SORT_LABEL) as Sort[]).map((s) => (
                    <option key={s} value={s}>
                      {SORT_LABEL[s]}
                    </option>
                  ))}
                </select>
              </label>
              <ViewToggle value={view} onChange={setView} />
            </div>
          </div>
          {filterCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-muted-foreground">Filters:</span>
              {search && (
                <Chip label={`“${search}”`} onRemove={() => setSearch("")} />
              )}
              {brands.map((b) => (
                <Chip key={b} label={b} onRemove={() => toggleBrand(b)} />
              ))}
              {onlyOffers && <Chip label="On offer" onRemove={() => setOnlyOffers(false)} />}
              {inStockOnly && (
                <Chip label="In stock" onRemove={() => setInStockOnly(false)} />
              )}
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-primary hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mt-5">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-12 text-center">
              <p className="text-sm text-muted-foreground">No products match these filters.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                Reset filters
              </Button>
            </div>
          ) : view === "grid" ? (
            <div className="grid gap-4 sm:gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((p, i) => (
                <ProductListItem key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
          <p className="mt-6 text-xs text-muted-foreground">
            Showing {filtered.length} of {products.length} products.
          </p>
        </div>

        {/* Mobile filter drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setFiltersOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-background shadow-2xl overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Filters</h3>
                <button
                  aria-label="Close filters"
                  className="inline-flex size-9 items-center justify-center rounded-full hover:bg-accent"
                  onClick={() => setFiltersOpen(false)}
                >
                  <X className="size-5" />
                </button>
              </div>
              <FilterPanel
                allBrands={allBrands}
                brands={brands}
                toggleBrand={toggleBrand}
                onlyOffers={onlyOffers}
                setOnlyOffers={setOnlyOffers}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
                clear={clearFilters}
                categories={categories}
                activeCategorySlug={activeCategorySlug}
              />
              <Button
                className="w-full mt-4"
                variant="gradient"
                onClick={() => setFiltersOpen(false)}
              >
                Show {filtered.length} results
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-xs hover:bg-accent"
    >
      {label}
      <X className="size-3" />
    </button>
  );
}

function FilterPanel(props: {
  allBrands: string[];
  brands: string[];
  toggleBrand: (b: string) => void;
  onlyOffers: boolean;
  setOnlyOffers: (v: boolean) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  clear: () => void;
  categories: Category[];
  activeCategorySlug?: string;
}) {
  return (
    <div className="space-y-6 rounded-2xl border bg-card p-5 shadow-sm">
      <div>
        <h4 className="font-semibold text-sm mb-2">Categories</h4>
        <div className="flex flex-col gap-1">
          <a
            href="/shop"
            className={`text-sm py-1.5 transition-colors ${
              !props.activeCategorySlug ? "text-primary font-semibold" : "text-foreground/80 hover:text-primary"
            }`}
          >
            All products
          </a>
          {props.categories.map((c) => {
            const active = props.activeCategorySlug === c.slug;
            return (
              <a
                key={c.id}
                href={`/shop/${c.slug}`}
                className={`text-sm py-1.5 transition-colors ${
                  active ? "text-primary font-semibold" : "text-foreground/80 hover:text-primary"
                }`}
              >
                {c.name}
              </a>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-2">Availability</h4>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={props.inStockOnly}
            onChange={(e) => props.setInStockOnly(e.target.checked)}
            className="size-4 rounded border-input accent-primary"
          />
          In stock only
        </label>
        <label className="flex items-center gap-2 text-sm mt-2">
          <input
            type="checkbox"
            checked={props.onlyOffers}
            onChange={(e) => props.setOnlyOffers(e.target.checked)}
            className="size-4 rounded border-input accent-primary"
          />
          Only items on offer
        </label>
      </div>

      {props.allBrands.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2">Brand</h4>
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
            {props.allBrands.map((b) => (
              <label key={b} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={props.brands.includes(b)}
                  onChange={() => props.toggleBrand(b)}
                  className="size-4 rounded border-input accent-primary"
                />
                {b}
              </label>
            ))}
          </div>
        </div>
      )}

      <Button variant="outline" size="sm" onClick={props.clear} className="w-full">
        Reset filters
      </Button>
    </div>
  );
}
