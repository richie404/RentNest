import React from "react";
import { ServerCrash, RefreshCw } from "lucide-react";

export const ErrorPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-2xl">
        <ServerCrash className="h-10 w-10" />
      </div>

      <h1 className="mt-6 font-heading text-4xl font-extrabold tracking-tight text-foreground">
        500 — Internal Server Error
      </h1>

      <p className="mt-2 max-w-md text-xs text-muted-foreground">
        An unexpected backend service error occurred while processing your query request.
      </p>

      <button
        onClick={() => window.location.reload()}
        className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
      >
        <RefreshCw className="h-4 w-4" />
        Reload Application Session
      </button>
    </div>
  );
};
