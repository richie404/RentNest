import React from "react";
import { Outlet } from "react-router";

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};
