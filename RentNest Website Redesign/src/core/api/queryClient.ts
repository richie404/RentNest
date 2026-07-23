import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes cache stale time
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time
      retry: (failureCount, error: unknown) => {
        // Do not retry on 401 or 403 authorization errors
        const status = (error as { status?: number })?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
