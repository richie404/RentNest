import React from "react";
import { Link } from "react-router";
import { FileQuestion, ArrowLeft } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-2xl">
        <FileQuestion className="h-10 w-10" />
      </div>

      <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-foreground">
        404 — Page Not Found
      </h1>

      <p className="mt-2 max-w-md text-xs text-muted-foreground">
        The requested URL endpoint or property document does not exist or may have been moved.
      </p>

      <Link
        to="/"
        className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Home Portal
      </Link>
    </div>
  );
};
