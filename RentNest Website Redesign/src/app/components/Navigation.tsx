import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "./ui/button";
import {
  Home,
  Search,
  Heart,
  MessageSquare,
  User,
  Menu,
  X,
  Building2,
  LayoutDashboard,
  Bell
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--royal-blue)] to-[var(--soft-indigo)] flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[var(--royal-blue)] to-[var(--soft-indigo)] bg-clip-text text-transparent">
              RentNest
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              to="/"
              className={`flex items-center gap-2 transition-colors ${
                isActive("/") ? "text-[var(--royal-blue)]" : "text-[var(--slate-gray)] hover:text-foreground"
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link
              to="/browse"
              className={`flex items-center gap-2 transition-colors ${
                isActive("/browse") ? "text-[var(--royal-blue)]" : "text-[var(--slate-gray)] hover:text-foreground"
              }`}
            >
              <Search className="w-4 h-4" />
              Browse
            </Link>
            <Link
              to="/favorites"
              className={`flex items-center gap-2 transition-colors ${
                isActive("/favorites") ? "text-[var(--royal-blue)]" : "text-[var(--slate-gray)] hover:text-foreground"
              }`}
            >
              <Heart className="w-4 h-4" />
              Favorites
            </Link>
            <Link
              to="/messages"
              className={`flex items-center gap-2 transition-colors relative ${
                isActive("/messages") ? "text-[var(--royal-blue)]" : "text-[var(--slate-gray)] hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Messages
              <Badge variant="destructive" className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Link>
          </div>

          {/* Right Section */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--coral-alert)] rounded-full" />
            </Button>

            <Link to="/add-listing">
              <Button className="bg-gradient-to-r from-[var(--royal-blue)] to-[var(--soft-indigo)] hover:opacity-90 transition-opacity rounded-full px-6">
                List Property
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--lavender-glow)] to-[var(--soft-indigo)] flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/renter-dashboard" className="cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Renter Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/owner-dashboard" className="cursor-pointer">
                    <Building2 className="w-4 h-4 mr-2" />
                    Owner Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin-dashboard" className="cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/login" className="cursor-pointer">
                    Logout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link to="/" className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted transition-colors">
                <Home className="w-5 h-5" />
                Home
              </Link>
              <Link to="/browse" className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted transition-colors">
                <Search className="w-5 h-5" />
                Browse
              </Link>
              <Link to="/favorites" className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted transition-colors">
                <Heart className="w-5 h-5" />
                Favorites
              </Link>
              <Link to="/messages" className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted transition-colors">
                <MessageSquare className="w-5 h-5" />
                Messages
              </Link>
              <Link to="/add-listing" className="mt-2">
                <Button className="w-full bg-gradient-to-r from-[var(--royal-blue)] to-[var(--soft-indigo)]">
                  List Property
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
