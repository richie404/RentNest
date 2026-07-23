import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Search, Building2, Wrench, FileText, User, ArrowRight } from "lucide-react";
import { Modal } from "../ui/Modal";
import { useUIStore } from "@/stores/uiStore";

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const searchItems = [
    { label: "Browse Properties Catalog", category: "Navigation", href: "/browse", icon: Building2 },
    { label: "Resident Tenant Dashboard", category: "Dashboards", href: "/app/tenant/dashboard", icon: User },
    { label: "Landlord Owner Dashboard", category: "Dashboards", href: "/app/owner/dashboard", icon: Building2 },
    { label: "Maintenance Work Orders", category: "Services", href: "/app/vendor/work-orders", icon: Wrench },
    { label: "Admin Control Center", category: "Management", href: "/app/admin/dashboard", icon: FileText },
  ];

  const filteredItems = searchItems.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    setCommandPaletteOpen(false);
    setQuery("");
    navigate(href);
  };

  return (
    <Modal
      isOpen={commandPaletteOpen}
      onClose={() => setCommandPaletteOpen(false)}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Search Bar Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search destination... (Press Esc to close)"
            className="w-full rounded-xl border border-border/60 bg-background/50 py-3 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
        </div>

        {/* Results List */}
        <div className="max-h-64 overflow-y-auto space-y-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item.href)}
                  className="flex cursor-pointer items-center justify-between rounded-xl p-3 text-xs hover:bg-primary/10 hover:text-primary transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary">{item.label}</p>
                      <span className="text-[10px] text-muted-foreground">{item.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })
          ) : (
            <p className="py-6 text-center text-xs text-muted-foreground">No matching commands found.</p>
          )}
        </div>
      </div>
    </Modal>
  );
};
