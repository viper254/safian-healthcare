"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

interface Notification {
  id: string;
  type: "order" | "low_stock" | "customer" | "review" | "system";
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationsDropdownProps {
  notifications: Notification[];
  unreadCount: number;
}

export function NotificationsDropdown({ notifications, unreadCount }: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount);

  async function markAsRead(id: string) {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setLocalNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        setLocalUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  }

  async function markAllAsRead() {
    try {
      const response = await fetch("/api/admin/notifications", {
        method: "POST",
      });

      if (response.ok) {
        setLocalNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true }))
        );
        setLocalUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }

  function getTimeAgo(dateString: string) {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (seconds < 60) return "just now";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      return date.toLocaleDateString();
    } catch {
      return "recently";
    }
  }

  return (
    <div className="relative">
      <button
        className="relative inline-flex size-10 items-center justify-center rounded-full hover:bg-accent"
        aria-label="Notifications"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="size-5" />
        {localUnreadCount > 0 && (
          <span className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border bg-background shadow-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Notifications</h3>
                {localUnreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {localUnreadCount} unread
                  </p>
                )}
              </div>
              {localUnreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {localNotifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                localNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-accent/50 cursor-pointer ${
                      !notification.is_read ? "bg-accent/20" : ""
                    }`}
                    onClick={() => {
                      if (!notification.is_read) {
                        markAsRead(notification.id);
                      }
                      if (notification.link) {
                        setIsOpen(false);
                        window.location.href = notification.link;
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`size-2 rounded-full mt-2 flex-shrink-0 ${
                          notification.is_read ? "bg-muted" : "bg-primary"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {localNotifications.length > 0 && (
              <div className="p-3 border-t text-center">
                <Link
                  href="/admin/notifications"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setIsOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
