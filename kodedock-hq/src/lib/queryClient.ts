import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once on failure
      refetchOnWindowFocus: false, // Don't refetch when switching tabs (good for admin panel)
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    },
  },
});
