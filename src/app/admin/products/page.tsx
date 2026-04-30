import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Search } from "lucide-react";
import { AdminTopbar } from "@/components/admin/topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getProducts } from "@/lib/data";
import { formatKES, effectivePrice } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await getProducts();
  return (
    <>
      <AdminTopbar
        title="Products"
        subtitle={`${products.length} products in the catalogue`}
      />
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
          <div className="relative flex-1 min-w-full sm:min-w-[240px] sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              className="h-10 w-full rounded-full border border-input bg-background pl-9 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button variant="gradient" className="sm:ml-auto" asChild>
            <Link href="/admin/products/new">
              <Plus className="size-4" /> New product
            </Link>
          </Button>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-left font-semibold">Product</th>
                  <th className="p-3 text-left font-semibold hidden md:table-cell">Category</th>
                  <th className="p-3 text-left font-semibold hidden lg:table-cell">SKU</th>
                  <th className="p-3 text-right font-semibold">Price</th>
                  <th className="p-3 text-right font-semibold hidden sm:table-cell">Stock</th>
                  <th className="p-3 text-left font-semibold">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => {
                  const { price, type } = effectivePrice(p);
                  const out = p.stock_quantity === 0;
                  const low =
                    p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold;
                  return (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative size-11 rounded-lg overflow-hidden bg-muted shrink-0">
                            {p.images[0]?.url && (
                              <Image
                                src={p.images[0].url}
                                alt={p.name}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium line-clamp-1">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">
                        {p.category?.name ?? "—"}
                      </td>
                      <td className="p-3 hidden lg:table-cell text-muted-foreground">
                        {p.sku ?? "—"}
                      </td>
                      <td className="p-3 text-right font-semibold">
                        {formatKES(price)}
                        {type !== "regular" && (
                          <div className="text-[10px] text-muted-foreground line-through">
                            {formatKES(p.original_price)}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right hidden sm:table-cell">
                        {p.stock_quantity}
                      </td>
                      <td className="p-3">
                        {out ? (
                          <Badge variant="destructive">Out</Badge>
                        ) : low ? (
                          <Badge variant="warning">Low</Badge>
                        ) : p.is_featured ? (
                          <Badge variant="success">Featured</Badge>
                        ) : (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/products/${p.id}`}>
                            <Pencil className="size-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
