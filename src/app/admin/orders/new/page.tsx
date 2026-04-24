import { AdminTopbar } from "@/components/admin/topbar";
import { ManualOrderForm } from "@/components/admin/manual-order-form";

export default function AdminNewOrderPage() {
  return (
    <>
      <AdminTopbar 
        title="Create Order" 
        subtitle="Manually create an order from WhatsApp or phone" 
      />
      <div className="p-4 sm:p-6 max-w-4xl">
        <ManualOrderForm />
      </div>
    </>
  );
}
