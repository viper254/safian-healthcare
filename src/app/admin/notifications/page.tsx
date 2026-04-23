import { AdminTopbar } from "@/components/admin/topbar";
import { getNotifications } from "@/lib/notifications";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminNotificationsPage() {
  const notifications = await getNotifications(50);

  return (
    <>
      <AdminTopbar title="Notifications" subtitle="View all system notifications" />
      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="size-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-lg border p-4 ${
                  !notification.is_read ? "bg-accent/20 border-primary/30" : "bg-card"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`size-2 rounded-full mt-2 flex-shrink-0 ${
                      notification.is_read ? "bg-muted" : "bg-primary"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <Button size="sm" variant="ghost">
                      <CheckCheck className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
