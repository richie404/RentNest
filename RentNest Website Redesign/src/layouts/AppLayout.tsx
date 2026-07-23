import React from "react";
import { Outlet } from "react-router";
import { AppShell } from "@/components/shared/AppShell";

export const AppLayout: React.FC = () => {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};
