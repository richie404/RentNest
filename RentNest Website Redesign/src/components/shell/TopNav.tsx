import React from "react";
import { Search, Sun, Moon } from "lucide-react";
import { Breadcrumbs } from "./Breadcrumbs";
import { NotificationCenter } from "./NotificationCenter";
import { ProfileMenu } from "./ProfileMenu";
import { MobileDrawer } from "./MobileDrawer";
import { useUIStore } from "@/stores/uiStore";
import { useThemeStore } from "@/stores/themeStore";

export const TopNav: React.FC = () => {
  const { setCommandPaletteOpen } = useUIStore();
  const { mode, setMode } = useThemeStore();

  const toggleTheme = () => {
    const nextMode = mode === "dark" ? "light" : "dark";
    setMode(nextMode);
    document.documentElement.classList.toggle("dark", nextMode === "dark");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <MobileDrawer />
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-3">
        {/* Cmd+K Search Trigger Button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 px-3.5 py-1.5 text-xs text-muted-foreground hover:border-primary/30 transition-all"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Quick Search...</span>
          <kbd className="rounded-md border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-mono font-semibold">
            ⌘K
          </kbd>
        </button>

        {/* Theme Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle Theme"
        >
          {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <NotificationCenter />
        <ProfileMenu />
      </div>
    </header>
  );
};
