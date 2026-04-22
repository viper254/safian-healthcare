import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CATEGORY_META, CATEGORY_ORDER, COMPANY_CONTACT, SITE_NAME } from "@/lib/constants";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t bg-muted/30">
      <div className="container py-14 grid gap-10 md:grid-cols-4">
        <div className="space-y-4">
          <Logo variant="full" />
          <p className="text-sm text-muted-foreground max-w-sm">
            {SITE_NAME} — trusted supplier of medical student kits, professional
            diagnostic tools, facility equipment and patient supplies across Kenya.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {CATEGORY_ORDER.map((slug) => (
              <li key={slug}>
                <Link href={`/shop/${slug}`} className="hover:text-foreground transition-colors">
                  {CATEGORY_META[slug].name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-foreground">About</Link></li>
            <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link href="/account/orders" className="hover:text-foreground">Track order</Link></li>
            <li><Link href="/login" className="hover:text-foreground">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Contact</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3"><Phone className="size-4 mt-0.5 text-primary" /><span>{COMPANY_CONTACT.phone}</span></li>
            <li className="flex gap-3"><Mail className="size-4 mt-0.5 text-primary" /><span>{COMPANY_CONTACT.email}</span></li>
            <li className="flex gap-3"><MapPin className="size-4 mt-0.5 text-primary" /><span>{COMPANY_CONTACT.address}</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {year} {SITE_NAME}. All rights reserved.</span>
          <span>Built with care for healthcare workers</span>
        </div>
      </div>
    </footer>
  );
}
