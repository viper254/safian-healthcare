import { AdminTopbar } from "@/components/admin/topbar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ReviewManagementCard } from "@/components/admin/review-management-card";
import { Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const supabase = await createSupabaseServerClient();
  
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      products (
        id,
        name,
        slug
      )
    `)
    .order("created_at", { ascending: false });

  const pending = reviews?.filter(r => !r.is_approved) || [];
  const approved = reviews?.filter(r => r.is_approved) || [];

  return (
    <>
      <AdminTopbar 
        title="Reviews Management" 
        subtitle="Approve, feature, and respond to customer reviews" 
      />
      <div className="p-4 sm:p-6">
        {/* Pending Reviews */}
        {pending.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="size-2 rounded-full bg-orange-500" />
              Pending Approval ({pending.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {pending.map((review) => (
                <ReviewManagementCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}

        {/* Approved Reviews */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="size-4 text-green-600" />
            Approved Reviews ({approved.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {approved.map((review) => (
              <ReviewManagementCard key={review.id} review={review} />
            ))}
          </div>
        </div>

        {reviews?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No reviews yet
          </div>
        )}
      </div>
    </>
  );
}
