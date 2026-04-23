import { AdminLoginForm } from "@/components/admin/login-form";
import { Logo } from "@/components/brand/logo";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin Login - Safian Healthcare",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // If already logged in as admin, redirect to dashboard
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      redirect("/admin");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-2xl shadow-lg border p-8">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access the admin dashboard
            </p>
          </div>

          <AdminLoginForm />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Protected area - Admin access only
        </p>
      </div>
    </div>
  );
}
