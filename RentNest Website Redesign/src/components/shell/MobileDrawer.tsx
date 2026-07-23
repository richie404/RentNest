import React from "react";
import { Link, useLocation } from "react-router";
import { Menu } from "lucide-react";
import { Drawer } from "../ui/Drawer";
import { useAuthStore } from "@/stores/authStore";

export const MobileDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  const getNavLinks = () => {
    switch (user?.roleName) {
      case "ROLE_TENANT":
        return [{ label: "Dashboard", href: "/app/tenant/dashboard" }, { label: "Browse", href: "/browse" }];
      case "ROLE_PROPERTY_OWNER":
        return [{ label: "Executive Dashboard", href: "/app/owner/dashboard" }, { label: "Browse", href: "/browse" }];
      case "ROLE_ADMIN":
        return [{ label: "Control Center", href: "/app/admin/dashboard" }];
      default:
        return [{ label: "Home", href: "/" }, { label: "Browse", href: "/browse" }];
    }
  };

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card text-muted-foreground hover:text-foreground"
        aria-label="Open Navigation Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="RentNest Navigation" position="left">
        <nav className="space-y-2 pt-2">
          {getNavLinks().map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className={`block rounded-xl px-4 py-3 text-xs font-semibold ${
                location.pathname === link.href ? "bg-primary text-white" : "text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <div className="pt-4 space-y-2 border-t border-border/40">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center rounded-xl border border-border py-2.5 text-xs font-semibold text-foreground"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block text-center rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-md"
              >
                Create Account
              </Link>
            </div>
          )}
        </nav>
      </Drawer>
    </div>
  );
};
