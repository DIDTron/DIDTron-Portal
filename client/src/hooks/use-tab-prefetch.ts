import { useCallback } from "react";
import { queryClient, STALE_TIME } from "@/lib/queryClient";

interface TabConfig {
  id: string;
  queryKey: string[];
  staleTime?: number;
}

export function useTabPrefetch(tabs: TabConfig[]) {
  const prefetchTab = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab) return;
      
      queryClient.prefetchQuery({
        queryKey: tab.queryKey,
        staleTime: tab.staleTime ?? STALE_TIME.LIST,
      });
    },
    [tabs]
  );

  const getTabProps = useCallback(
    (tabId: string) => ({
      onMouseEnter: () => prefetchTab(tabId),
      onFocus: () => prefetchTab(tabId),
    }),
    [prefetchTab]
  );

  return { prefetchTab, getTabProps };
}

export function prefetchOnHover(queryKey: string[], staleTime = STALE_TIME.LIST) {
  return {
    onMouseEnter: () => {
      queryClient.prefetchQuery({ queryKey, staleTime });
    },
  };
}
