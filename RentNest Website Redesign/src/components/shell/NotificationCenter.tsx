import React, { useState } from "react";
import { Bell, CheckCircle2, AlertTriangle, Info, Trash2 } from "lucide-react";
import { Drawer } from "../ui/Drawer";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "success" | "warning" | "info";
  read: boolean;
}

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Rent Payment Received",
      message: "Monthly payment of $3,200 for Unit 402 processed successfully.",
      time: "10 mins ago",
      type: "success",
      read: false,
    },
    {
      id: "2",
      title: "Work Order Dispatched",
      message: "Vendor 'Apex Plumbing Services' assigned to Ticket #804.",
      time: "1 hour ago",
      type: "info",
      read: false,
    },
    {
      id: "3",
      title: "Lease Approval Required",
      message: "New applicant lease for Grand Horizon Unit #204 requires owner signature.",
      time: "3 hours ago",
      type: "warning",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <>
      {/* Topbar Trigger Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Open Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Notification Center">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3 text-xs">
            <span className="font-semibold text-muted-foreground">
              {unreadCount} Unread Alerts
            </span>
            <div className="flex gap-2">
              <button
                onClick={markAllAsRead}
                className="text-primary hover:underline font-medium"
              >
                Mark all read
              </button>
              <button
                onClick={clearNotifications}
                className="text-rose-500 hover:underline flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`rounded-2xl border p-3.5 text-xs transition-colors ${
                    n.read ? "border-border/40 bg-card/40" : "border-primary/30 bg-primary/5"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {n.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />}
                    {n.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />}
                    {n.type === "info" && <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-foreground">{n.title}</h5>
                        <span className="text-[10px] text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="mt-1 text-muted-foreground leading-normal">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-xs text-muted-foreground">No notifications.</p>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
};
