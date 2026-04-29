import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COMPANY_CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with Safian Healthcare & Supplies.",
};

export default function ContactPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Get in touch
        </p>
        <h1 className="mt-3 font-display font-bold text-4xl sm:text-5xl text-balance">
          We&apos;re here to help — 7 days a week.
        </h1>
        <p className="mt-4 text-muted-foreground">
          For product questions, bulk quotations, tender invites, or partnership
          enquiries, send us a message and we&apos;ll get back within a few hours.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <form
          className="rounded-2xl border bg-card p-6 shadow-sm space-y-5"
          action={`mailto:${COMPANY_CONTACT.email}`}
          method="post"
          encType="text/plain"
          autoComplete="on"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" name="name" autoComplete="name" required />
            </div>
            <div>
              <Label htmlFor="org">Organisation</Label>
              <Input id="org" name="org" autoComplete="organization" placeholder="Optional" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" autoComplete="tel" required />
            </div>
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" name="subject" autoComplete="off" required />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" rows={6} autoComplete="off" required />
          </div>
          <Button type="submit" variant="gradient" size="lg">
            Send message
          </Button>
        </form>
        <aside className="space-y-4">
          <ContactCard
            icon={Phone}
            title="Call us"
            value={COMPANY_CONTACT.phone}
            href={`tel:${COMPANY_CONTACT.phone.replace(/\s/g, "")}`}
          />
          <ContactCard
            icon={MessageCircle}
            title="WhatsApp"
            value={COMPANY_CONTACT.whatsapp}
            href={`https://wa.me/${COMPANY_CONTACT.whatsapp.replace(/\D/g, "")}`}
          />
          <ContactCard
            icon={Mail}
            title="Email"
            value={COMPANY_CONTACT.email}
            href={`mailto:${COMPANY_CONTACT.email}`}
          />
          <ContactCard icon={MapPin} title="Visit" value={COMPANY_CONTACT.address} />
        </aside>
      </div>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  title,
  value,
  href,
}: {
  icon: typeof Phone;
  title: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3 rounded-2xl border bg-card p-4 shadow-sm">
      <span className="inline-flex size-10 items-center justify-center rounded-lg bg-brand-gradient text-white shrink-0">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          {title}
        </p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
  if (href)
    return (
      <a href={href} className="block hover:-translate-y-0.5 transition-transform">
        {content}
      </a>
    );
  return content;
}
