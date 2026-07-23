import React from "react";
import { Moon, Sun, Bell, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { useThemeStore } from "@/stores/themeStore";

export const UserSettingsPage: React.FC = () => {
  const { mode, setMode } = useThemeStore();

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Platform Preferences & Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          Customize UI theme mode, alert preferences, and security permissions.
        </p>
      </div>

      <Card variant="default" className="p-6 space-y-6">
        <div>
          <h4 className="font-heading text-sm font-bold text-foreground mb-3">Appearance Theme</h4>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setMode("light");
                document.documentElement.classList.remove("dark");
              }}
              className={`flex-1 rounded-2xl border p-4 text-xs font-semibold flex items-center justify-center gap-2 ${
                mode === "light" ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"
              }`}
            >
              <Sun className="h-4 w-4" /> Light Mode
            </button>

            <button
              onClick={() => {
                setMode("dark");
                document.documentElement.classList.add("dark");
              }}
              className={`flex-1 rounded-2xl border p-4 text-xs font-semibold flex items-center justify-center gap-2 ${
                mode === "dark" ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground"
              }`}
            >
              <Moon className="h-4 w-4" /> Dark Mode
            </button>
          </div>
        </div>

        <div className="border-t border-border/40 pt-6">
          <h4 className="font-heading text-sm font-bold text-foreground mb-3">Notification Preferences</h4>
          <div className="space-y-3">
            <Checkbox label="Email me monthly rent invoice reminders" defaultChecked />
            <Checkbox label="Send SMS text alerts for maintenance ticket updates" defaultChecked />
            <Checkbox label="Notify me about new property saved search matches" defaultChecked />
          </div>
        </div>

        <div className="border-t border-border/40 pt-4 flex justify-end">
          <Button variant="primary">Update Settings</Button>
        </div>
      </Card>
    </div>
  );
};
