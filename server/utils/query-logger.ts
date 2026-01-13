const SLOW_QUERY_THRESHOLD_MS = 500;

export async function logSlowQuery<T>(
  name: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await queryFn();
    const duration = Date.now() - start;
    
    if (duration > SLOW_QUERY_THRESHOLD_MS) {
      console.warn(`[SLOW QUERY] ${name} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[QUERY ERROR] ${name} failed after ${duration}ms:`, error);
    throw error;
  }
}
