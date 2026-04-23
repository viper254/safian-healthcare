import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface Notification {
  id: string;
  type: "order" | "low_stock" | "customer" | "review" | "system";
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications(limit = 10): Promise<Notification[]> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getNotifications:", error);
    return [];
  }
}

export async function getUnreadCount(): Promise<number> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);

    if (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getUnreadCount:", error);
    return 0;
  }
}
