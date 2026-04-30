import Link from "next/link";
import { Home, Search, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] py-20 text-center">
      <div className="inline-flex size-20 items-center justify-center rounded-full bg-muted text-muted-foreground mb-6">
        <span className="font-display font-bold text-4xl">404</span>
      </div>
      
      <h1 className="font-display font-bold text-3xl mb-3">Page not found</h1>
      
      <p className="text-muted-foreground max-w-md mb-8">
        Sorry, we couldn't find the page you're looking for. It may have been moved or deleted.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild variant="gradient" size="lg">
          <Link href="/">
            <Home className="size-4" />
            Go home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/shop">
            <ShoppingBag className="size-4" />
            Browse products
          </Link>
        </Button>
      </div>

      <div className="mt-12 text-sm text-muted-foreground">
        <p>Looking for something specific?</p>
        <Link href="/shop" className="text-primary hover:underline font-medium">
          Try our search
        </Link>
      </div>
    </div>
  );
}
