import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "full",
  href = "/",
}: {
  className?: string;
  variant?: "full" | "mark";
  href?: string | null;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-black/5 shadow-sm">
        <Image
          src="/logo.jpeg"
          alt="Safian Healthcare & Supplies logo"
          fill
          sizes="40px"
          className="object-cover"
          priority
        />
      </span>
      {variant === "full" && (
        <span className="hidden sm:flex flex-col leading-tight">
          <span className="font-display font-bold text-base tracking-tight text-brand-gradient">
            SAFIAN
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Healthcare & Supplies
          </span>
        </span>
      )}
    </span>
  );
  if (!href) return content;
  return (
    <Link href={href} aria-label="Safian Healthcare home" className="group">
      {content}
    </Link>
  );
}
