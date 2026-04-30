import Link from "next/link";
import { Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ShopNotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[50vh] py-20 text-center">
      <div className="inline-flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground mb-6">
        <ShoppingBag className="size-8" />
      </div>
      
      <h1 className="font-display font-bold text-2xl mb-3">Category not found</h1>
      
      <p className="text-muted-foreground max-w-md mb-8">
        We couldn't find the category you're looking for.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild variant="gradient">
          <Link href="/shop">
            <ShoppingBag className="size-4" />
            View all products
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="size-4" />
            Go home
          </Link>
        </Button>
      </div>
    </div>
  );
}
