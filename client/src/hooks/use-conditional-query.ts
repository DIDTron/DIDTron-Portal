import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { STALE_TIME, keepPreviousData } from "@/lib/queryClient";

interface UseConditionalQueryOptions<T> {
  queryKey: string[];
  enabled: boolean;
  staleTime?: number;
}

export function useConditionalQuery<T>({
  queryKey,
  enabled,
  staleTime = STALE_TIME.LIST,
}: UseConditionalQueryOptions<T>) {
  return useQuery<T>({
    queryKey,
    enabled,
    staleTime,
    placeholderData: keepPreviousData,
  });
}
