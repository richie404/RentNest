import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-xl">
            <AlertOctagon className="h-8 w-8" />
          </div>
          <h1 className="mt-6 font-heading text-2xl font-bold tracking-tight text-foreground">
            Something Went Wrong
          </h1>
          <p className="mt-2 max-w-md text-xs text-muted-foreground">
            An unhandled system exception occurred. Our engineering team has been notified.
          </p>

          {this.state.error && (
            <div className="mt-4 rounded-xl bg-muted/60 p-3 max-w-md font-mono text-[11px] text-rose-500 overflow-x-auto">
              {this.state.error.message}
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
