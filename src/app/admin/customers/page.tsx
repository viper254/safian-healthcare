import { AdminTopbar } from "@/components/admin/topbar";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types";

async function loadProfiles(): Promise<{ profiles: Profile[]; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Failed to load profiles:", error.message);
      return { profiles: [], error: error.message };
    }

    return { profiles: (data as Profile[]) ?? [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to load profiles:", message);
    return { profiles: [], error: message };
  }
}

export default async function AdminCustomersPage() {
  const { profiles, error } = await loadProfiles();
  return (
    <>
      <AdminTopbar title="Customers" subtitle={`${profiles.length} registered profiles`} />
      <div className="p-4 sm:p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">Failed to load customer data</p>
            <p className="mt-1 text-red-600">{error}</p>
          </div>
        )}
        {!error && profiles.length === 0 && (
          <div className="rounded-2xl border bg-card shadow-sm p-8 text-center">
            <p className="text-muted-foreground">No registered customers yet.</p>
          </div>
        )}
        {profiles.length > 0 && (
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-3 text-left font-semibold">Name</th>
                    <th className="p-3 text-left font-semibold">Email</th>
                    <th className="p-3 text-left font-semibold hidden md:table-cell">Phone</th>
                    <th className="p-3 text-left font-semibold hidden sm:table-cell">Joined</th>
                    <th className="p-3 text-left font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {profiles.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="p-3 font-medium">{p.full_name ?? "\u2014"}</td>
                      <td className="p-3 text-muted-foreground">{p.email}</td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground">
                        {p.phone ?? "\u2014"}
                      </td>
                      <td className="p-3 hidden sm:table-cell text-muted-foreground">
                        {formatDate(p.created_at)}
                      </td>
                      <td className="p-3">
                        <Badge variant={p.role === "admin" ? "default" : "secondary"} className="capitalize">
                          {p.role}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
