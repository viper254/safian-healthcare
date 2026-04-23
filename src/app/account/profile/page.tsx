import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/account/profile-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account/profile");
  }

  // Get profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="container py-10 max-w-2xl">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to account
      </Link>

      <h1 className="font-display font-bold text-3xl">Profile Settings</h1>
      <p className="text-muted-foreground mt-2">
        Update your personal information and contact details
      </p>

      <div className="mt-8 rounded-2xl border bg-card p-6">
        <ProfileForm
          user={user}
          profile={profile}
        />
      </div>
    </div>
  );
}
