import { QueryClient, QueryFunction, keepPreviousData } from "@tanstack/react-query";

// Performance constants per docs/PERFORMANCE.md
export const STALE_TIME = {
  LIST: 30 * 1000,      // 30 seconds for list queries
  DETAIL: 60 * 1000,    // 1 minute for detail queries  
  STATIC: 5 * 60 * 1000, // 5 minutes for static/config data
  REALTIME: 10 * 1000,  // 10 seconds for near-realtime data
};

// Re-export for use in components
export { keepPreviousData };

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: STALE_TIME.LIST, // 30 seconds default per PERFORMANCE.md
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
