import { useInfiniteQuery, UseInfiniteQueryOptions } from "@tanstack/react-query";
import { STALE_TIME, keepPreviousData } from "@/lib/queryClient";

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

interface UseCursorQueryOptions<T> {
  queryKey: string[];
  enabled?: boolean;
  staleTime?: number;
  limit?: number;
}

export function useCursorQuery<T>({
  queryKey,
  enabled = true,
  staleTime = STALE_TIME.LIST,
  limit = 50,
}: UseCursorQueryOptions<T>) {
  const baseUrl = queryKey[0];
  
  return useInfiniteQuery<CursorPaginationResult<T>>({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const url = new URL(baseUrl, window.location.origin);
      url.searchParams.set("limit", String(limit));
      if (pageParam) {
        url.searchParams.set("cursor", pageParam as string);
      }
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return res.json();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
    staleTime,
    placeholderData: keepPreviousData,
  });
}

export function flattenCursorPages<T>(
  pages: CursorPaginationResult<T>[] | undefined
): T[] {
  if (!pages) return [];
  return pages.flatMap((page) => page.data);
}
