import { AdminTopbar } from "@/components/admin/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE_NAME, COMPANY_CONTACT } from "@/lib/constants";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminTopbar title="Settings" subtitle="Store and brand preferences" />
      <div className="p-4 sm:p-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card shadow-sm p-6 space-y-4">
          <header>
            <h2 className="font-semibold">Store</h2>
            <p className="text-xs text-muted-foreground">Displayed across the site and invoices.</p>
          </header>
          <div className="space-y-2">
            <Label htmlFor="store_name">Store name</Label>
            <Input id="store_name" defaultValue={SITE_NAME} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store_address">Address</Label>
            <Input id="store_address" defaultValue={COMPANY_CONTACT.address} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="store_email">Email</Label>
              <Input id="store_email" defaultValue={COMPANY_CONTACT.email} type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store_phone">Phone</Label>
              <Input id="store_phone" defaultValue={COMPANY_CONTACT.phone} type="tel" />
            </div>
          </div>
          <Button variant="gradient">Save changes</Button>
        </section>

        <section className="rounded-2xl border bg-card shadow-sm p-6 space-y-4">
          <header>
            <h2 className="font-semibold">Delivery & pricing</h2>
            <p className="text-xs text-muted-foreground">Shown at cart & checkout.</p>
          </header>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="delivery_fee">Default delivery fee (KES)</Label>
              <Input id="delivery_fee" defaultValue="350" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="free_threshold">Free delivery over (KES)</Label>
              <Input id="free_threshold" defaultValue="15000" type="number" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="about">Store short description</Label>
            <Textarea
              id="about"
              rows={4}
              defaultValue="Trusted medical tools, kits & facility supplies across Kenya."
            />
          </div>
          <Button variant="gradient">Save changes</Button>
        </section>
      </div>
    </>
  );
}
