import React, { useState } from "react";
import { Send, Bell, Mail, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAdminNotificationsQuery } from "@/features/admin/hooks/useAdminData";
import { showToast } from "@/components/ui/Toast";

export const AdminNotificationsPage: React.FC = () => {
  const { data: broadcasts = [] } = useAdminNotificationsQuery();

  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState("ALL");
  const [channel, setChannel] = useState("IN_APP");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    showToast.success("Broadcast Dispatched", `Sent broadcast notification to ${targetRole} group.`);
    setTitle("");
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Platform System Broadcast Notifications
        </h1>
        <p className="text-xs text-muted-foreground">
          Send platform announcements, maintenance notices, and tax alerts via In-App, Email, or SMS push.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broadcast Form */}
        <Card variant="default" className="p-6 space-y-4">
          <h3 className="font-heading text-sm font-bold text-foreground">Dispatch New System Announcement</h3>
          <form onSubmit={handleSend} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Notice Headline</label>
              <Input
                placeholder="e.g. Scheduled System Outage Notice"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Target Audience</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full rounded-2xl border border-border/60 bg-background/50 py-2.5 px-3 text-xs text-foreground focus:outline-none"
              >
                <option value="ALL">All Platform Users</option>
                <option value="TENANTS">Tenants Only</option>
                <option value="OWNERS">Property Owners Only</option>
                <option value="VENDORS">Vendors Only</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Delivery Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full rounded-2xl border border-border/60 bg-background/50 py-2.5 px-3 text-xs text-foreground focus:outline-none"
              >
                <option value="IN_APP">In-App Notification Center</option>
                <option value="EMAIL">Email Blast</option>
                <option value="PUSH_SMS">Mobile Push / SMS</option>
              </select>
            </div>

            <Button type="submit" variant="primary" size="sm" className="w-full" leftIcon={<Send className="h-4 w-4" />}>
              Dispatch Announcement
            </Button>
          </form>
        </Card>

        {/* History Stream */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-heading text-sm font-bold text-foreground">Recent Broadcast History</h3>
          {broadcasts.map((b) => (
            <Card key={b.id} variant="default" className="p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <h4 className="font-heading text-xs font-bold text-foreground">{b.title}</h4>
                <span className="text-[10px] text-muted-foreground">{b.sentAt}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Audience: <strong>{b.targetRole}</strong> via <strong>{b.channel}</strong></span>
                <span className="font-bold text-emerald-500">{b.deliveredCount} Delivered</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
