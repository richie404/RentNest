import React from "react";
import { Outlet, Link } from "react-router";
import { useAuthStore } from "@/stores/authStore";

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  const getDashboardHref = () => {
    switch (user?.roleName) {
      case "ROLE_PROPERTY_OWNER":
        return "/app/owner/dashboard";
      case "ROLE_VENDOR":
        return "/app/vendor/dashboard";
      case "ROLE_ADMIN":
        return "/app/admin/dashboard";
      default:
        return "/app/tenant/dashboard";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-bold shadow-md">
              RN
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-foreground">
              Rent<span className="text-primary">Nest</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <Link to="/browse" className="hover:text-foreground transition-colors">
              Browse Properties
            </Link>
            <Link to="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={getDashboardHref()}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-primary/90 transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-primary/90 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card py-8 px-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 RentNest Platform Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/about" className="hover:underline">Privacy Policy</Link>
            <Link to="/about" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
