import { AdminTopbar } from "@/components/admin/topbar";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient, supabaseIsConfigured } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types";

const mockProfiles: Profile[] = [
  {
    id: "1",
    email: "amina@example.com",
    full_name: "Dr. Amina Wanjiru",
    phone: "+254700000001",
    role: "customer",
    created_at: "2025-11-12T10:00:00Z",
    updated_at: "2025-11-12T10:00:00Z",
  },
  {
    id: "2",
    email: "peter@afyabora.co.ke",
    full_name: "Peter Otieno",
    phone: "+254700000002",
    role: "customer",
    created_at: "2025-10-04T08:20:00Z",
    updated_at: "2025-10-04T08:20:00Z",
  },
  {
    id: "3",
    email: "grace@uzimahc.co.ke",
    full_name: "Sr. Grace Mumbi",
    phone: "+254700000003",
    role: "customer",
    created_at: "2025-09-22T09:00:00Z",
    updated_at: "2025-09-22T09:00:00Z",
  },
  {
    id: "4",
    email: "admin@safian.co.ke",
    full_name: "Safian Admin",
    phone: "+254700000009",
    role: "admin",
    created_at: "2025-08-01T07:00:00Z",
    updated_at: "2025-08-01T07:00:00Z",
  },
];

async function loadProfiles(): Promise<Profile[]> {
  if (!supabaseIsConfigured()) return mockProfiles;
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    return (data as Profile[]) ?? mockProfiles;
  } catch {
    return mockProfiles;
  }
}

export default async function AdminCustomersPage() {
  const profiles = await loadProfiles();
  return (
    <>
      <AdminTopbar title="Customers" subtitle={`${profiles.length} registered profiles`} />
      <div className="p-4 sm:p-6">
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
                    <td className="p-3 font-medium">{p.full_name ?? "—"}</td>
                    <td className="p-3 text-muted-foreground">{p.email}</td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground">
                      {p.phone ?? "—"}
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
      </div>
    </>
  );
}
