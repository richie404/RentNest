import React from "react";
import { Sidebar } from "../shell/Sidebar";
import { TopNav } from "../shell/TopNav";
import { CommandPalette } from "../shell/CommandPalette";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main View Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <TopNav />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Cmd+K Command Palette Search Modal */}
      <CommandPalette />
    </div>
  );
};
