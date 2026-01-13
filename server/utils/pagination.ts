import { gt, asc, desc, SQL } from "drizzle-orm";

export interface CursorPaginationParams {
  cursor?: string | null;
  limit?: number;
  maxLimit?: number;
}

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  total?: number;
}

export function parseCursorParams(params: CursorPaginationParams) {
  const limit = Math.min(
    parseInt(String(params.limit)) || 20,
    params.maxLimit || 100
  );
  return {
    cursor: params.cursor || null,
    limit,
  };
}

export function buildCursorResponse<T extends { id: string }>(
  results: T[],
  limit: number
): CursorPaginationResult<T> {
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, -1) : results;
  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;
  
  return { data, nextCursor, hasMore };
}
