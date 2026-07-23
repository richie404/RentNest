import React, { useState } from "react";
import { useNavigate } from "react-router";
import { LogOut, Shield, ChevronDown, Check } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { useAuthStore } from "@/stores/authStore";
import type { UserRole } from "@/core/types/auth";

export const ProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, clearSession, setSession } = useAuthStore();
  const navigate = useNavigate();

  const roleLabels: Record<UserRole, string> = {
    ROLE_GUEST: "Guest User",
    ROLE_TENANT: "Residential Tenant",
    ROLE_PROPERTY_OWNER: "Property Owner",
    ROLE_VENDOR: "Maintenance Vendor",
    ROLE_ADMIN: "Platform Admin",
    ROLE_SUPPORT: "Support Agent",
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    setIsOpen(false);
    if (!user) return;
    const updatedUser = { ...user, roleName: newRole };
    setSession(useAuthStore.getState().accessToken || "mock_token", updatedUser);

    switch (newRole) {
      case "ROLE_PROPERTY_OWNER":
        navigate("/app/owner/dashboard");
        break;
      case "ROLE_VENDOR":
        navigate("/app/vendor/dashboard");
        break;
      case "ROLE_ADMIN":
        navigate("/app/admin/dashboard");
        break;
      case "ROLE_TENANT":
        navigate("/app/tenant/dashboard");
        break;
      default:
        navigate("/");
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <div className="relative inline-block text-left">
      {/* Avatar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl p-1 hover:bg-muted transition-colors focus:outline-none"
      >
        <Avatar
          src={user?.avatarUrl}
          fallbackInitials={user?.firstName?.[0] || "RN"}
          size="sm"
          status="online"
        />
        <div className="hidden text-left md:block">
          <p className="text-xs font-semibold text-foreground leading-tight">{user?.fullName || "Guest User"}</p>
          <p className="text-[10px] text-muted-foreground uppercase">{user?.roleName?.replace("ROLE_", "") || "GUEST"}</p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {/* Profile Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-border/60 bg-card p-3 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-border/40 pb-3 px-2">
            <p className="text-xs font-bold text-foreground">{user?.fullName || "Guest Account"}</p>
            <p className="text-[11px] text-muted-foreground">{user?.email || "guest@rentnest.com"}</p>
          </div>

          {/* Role Switching Simulator for Testing */}
          <div className="py-2">
            <span className="block px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Switch Active Role
            </span>
            <div className="mt-1 space-y-0.5">
              {(Object.keys(roleLabels) as UserRole[]).map((r) => {
                const isActive = user?.roleName === r;
                return (
                  <button
                    key={r}
                    onClick={() => handleRoleSwitch(r)}
                    className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 text-xs text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                      {roleLabels[r]}
                    </span>
                    {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border/40 pt-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
