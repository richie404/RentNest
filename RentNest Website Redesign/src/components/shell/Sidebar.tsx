import React from "react";
import { Link, useLocation } from "react-router";
import {
  Home,
  Building2,
  FileText,
  DollarSign,
  Wrench,
  Users,
  ShieldCheck,
  MessageSquare,
  Heart,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Calendar,
  Package,
  Star,
  Settings,
  Bell,
  Activity,
  Flag,
  HelpCircle,
  Lock,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import type { UserRole } from "@/core/types/auth";
import { cn } from "@/lib/utils";

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const location = useLocation();

  const role: UserRole = user?.roleName || "ROLE_ADMIN";

  const getNavItems = () => {
    switch (role) {
      case "ROLE_TENANT":
        return [
          { label: "Overview Dashboard", href: "/app/tenant/dashboard", icon: Home },
          { label: "Browse Listings", href: "/browse", icon: Building2 },
          { label: "Lease Contracts", href: "/app/tenant/leases", icon: FileText },
          { label: "Rent Payments", href: "/app/tenant/payments", icon: DollarSign },
          { label: "Maintenance Requests", href: "/app/tenant/maintenance", icon: Wrench },
          { label: "Rental Analytics", href: "/app/tenant/analytics", icon: BarChart2 },
          { label: "Messages", href: "/app/tenant/messages", icon: MessageSquare },
          { label: "Saved Favorites", href: "/favorites", icon: Heart },
        ];
      case "ROLE_PROPERTY_OWNER":
        return [
          { label: "Executive Dashboard", href: "/app/owner/dashboard", icon: Home },
          { label: "Property Listings", href: "/app/owner/properties", icon: Building2 },
          { label: "Lease Approvals", href: "/app/owner/approvals", icon: FileText },
          { label: "Revenue & Payouts", href: "/app/owner/revenue", icon: DollarSign },
          { label: "Maintenance Supervisor", href: "/app/owner/maintenance", icon: Wrench },
          { label: "Financial Reports", href: "/app/owner/reports", icon: BarChart2 },
          { label: "Calendar Schedule", href: "/app/owner/calendar", icon: Calendar },
          { label: "Messages", href: "/messages", icon: MessageSquare },
        ];
      case "ROLE_VENDOR":
        return [
          { label: "Vendor Dashboard", href: "/app/vendor/dashboard", icon: Home },
          { label: "Assigned Work Orders", href: "/app/vendor/jobs", icon: Wrench },
          { label: "Dispatch Calendar", href: "/app/vendor/calendar", icon: Calendar },
          { label: "Completed Jobs", href: "/app/vendor/completed", icon: ShieldCheck },
          { label: "Billing & Invoices", href: "/app/vendor/invoices", icon: FileText },
          { label: "Payouts & Ledger", href: "/app/vendor/payments", icon: DollarSign },
          { label: "Customer Ratings", href: "/app/vendor/ratings", icon: Star },
          { label: "Parts Inventory", href: "/app/vendor/inventory", icon: Package },
          { label: "Revenue Analytics", href: "/app/vendor/reports", icon: BarChart2 },
          { label: "Messages", href: "/app/vendor/messages", icon: MessageSquare },
          { label: "Company Settings", href: "/app/vendor/settings", icon: Settings },
        ];
      case "ROLE_ADMIN":
        return [
          { label: "Control Center", href: "/app/admin/dashboard", icon: Home },
          { label: "User Directory", href: "/app/admin/users", icon: Users },
          { label: "RBAC Roles", href: "/app/admin/roles", icon: ShieldCheck },
          { label: "Permissions", href: "/app/admin/permissions", icon: Lock },
          { label: "Property Listings", href: "/app/admin/properties", icon: Building2 },
          { label: "Lease Bookings", href: "/app/admin/bookings", icon: FileText },
          { label: "Payments Clearing", href: "/app/admin/payments", icon: DollarSign },
          { label: "Maintenance SLA", href: "/app/admin/maintenance", icon: Wrench },
          { label: "Executive Analytics", href: "/app/admin/analytics", icon: BarChart2 },
          { label: "Reports & Audits", href: "/app/admin/reports", icon: FileText },
          { label: "Audit Logs", href: "/app/admin/audit-logs", icon: ShieldCheck },
          { label: "System Broadcasts", href: "/app/admin/notifications", icon: Bell },
          { label: "Support Desk", href: "/app/admin/support", icon: HelpCircle },
          { label: "AI Monitoring", href: "/app/admin/ai-monitoring", icon: Activity },
          { label: "System Telemetry", href: "/app/admin/system-health", icon: Activity },
          { label: "Feature Flags", href: "/app/admin/feature-flags", icon: Flag },
          { label: "Global Settings", href: "/app/admin/settings", icon: Settings },
        ];
      default:
        return [
          { label: "Home", href: "/", icon: Home },
          { label: "Browse Properties", href: "/browse", icon: Building2 },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      className={cn(
        "sticky top-0 z-40 hidden md:flex h-screen flex-col border-r border-border/40 bg-card/50 backdrop-blur-xl transition-all duration-300",
        sidebarCollapsed ? "w-20" : "w-64"
      )}
      aria-label="Sidebar Navigation"
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-border/40 shrink-0">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-bold shadow-md">
            RN
          </div>
          {!sidebarCollapsed && (
            <span className="font-heading text-xl font-bold tracking-tight text-foreground">
              Rent<span className="text-primary">Nest</span>
            </span>
          )}
        </Link>

        <button
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Tree */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-white font-semibold shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-muted-foreground")} />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
