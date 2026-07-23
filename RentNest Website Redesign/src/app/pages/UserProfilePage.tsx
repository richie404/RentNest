import React from "react";
import { User, Mail, Phone, Shield, Camera } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";

export const UserProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          User Account Profile
        </h1>
        <p className="text-xs text-muted-foreground">
          Manage your personal credentials, contact details, and account security.
        </p>
      </div>

      <Card variant="default" className="p-6">
        <div className="flex items-center gap-6 border-b border-border/40 pb-6">
          <div className="relative">
            <Avatar src={user?.avatarUrl} fallbackInitials={user?.firstName?.[0] || "RN"} size="xl" />
            <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          <div>
            <h3 className="font-heading text-lg font-bold text-foreground">{user?.fullName || "Jane Doe"}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full mt-1">
              <Shield className="h-3 w-3" />
              {user?.roleName?.replace("ROLE_", "") || "TENANT"}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px]">Email Address</span>
            <strong className="text-foreground text-sm font-semibold">{user?.email || "jane@example.com"}</strong>
          </div>
          <div>
            <span className="text-muted-foreground block text-[10px]">User Account ID</span>
            <strong className="text-foreground text-sm font-mono font-semibold">USR-{user?.userId || "101"}</strong>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border/30 flex justify-end">
          <Button variant="primary">Save Changes</Button>
        </div>
      </Card>
    </div>
  );
};
