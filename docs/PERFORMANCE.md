# DIDTron Performance Governance (MANDATORY)

This document contains mandatory performance rules that MUST be followed for ALL code changes.
The agent MUST verify compliance with these rules before marking any task as complete.

---

## 1. Frontend Performance Rules

### 1.1 TanStack Query Requirements
Every `useQuery` call MUST include:
- `staleTime`: Minimum 30 seconds for lists, 5 minutes for static data
- `keepPreviousData: true` for paginated lists
- Proper error/loading states

```typescript
// REQUIRED pattern for all queries
const { data, isLoading } = useQuery({
  queryKey: ["/api/entity", filters],
  staleTime: 30 * 1000, // MANDATORY
  keepPreviousData: true, // MANDATORY for pagination
});
```

### 1.2 Route Prefetching
- Prefetch next route data on sidebar item hover
- Prefetch detail page data on table row hover
- Use `queryClient.prefetchQuery()` for anticipated navigation

```typescript
// Prefetch on hover
onMouseEnter={() => {
  queryClient.prefetchQuery({
    queryKey: ["/api/entity", id],
    staleTime: 60 * 1000,
  });
}}
```

### 1.3 Code Splitting (Lazy Loading)
Large modules MUST be lazy loaded:
- Softswitch module
- Billing module
- Reports module
- Experience Manager

```typescript
// REQUIRED for large modules
const SoftswitchModule = lazy(() => import("./pages/admin/softswitch"));
```

### 1.4 Virtualized Tables
Any list/table with potential for >200 rows MUST use virtualization:
- Use `@tanstack/react-virtual` or similar
- Only render visible rows in DOM
- Implement infinite scroll or cursor pagination

### 1.5 Optimistic UI
For create/update operations:
- Update UI immediately before server confirmation
- Show loading indicator
- Rollback on failure with clear error message

```typescript
// REQUIRED pattern for mutations
const mutation = useMutation({
  mutationFn: createEntity,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["/api/entities"] });
    // Optimistically update cache
    const previous = queryClient.getQueryData(["/api/entities"]);
    queryClient.setQueryData(["/api/entities"], (old) => [...old, newData]);
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(["/api/entities"], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/entities"] });
  },
});
```

---

## 2. Backend Performance Rules

### 2.1 Cursor Pagination (MANDATORY)
Every list API MUST use cursor pagination, NOT offset pagination:

```typescript
// REQUIRED: Cursor pagination
app.get("/api/entities", async (req, res) => {
  const { cursor, limit = 20 } = req.query;
  const maxLimit = Math.min(parseInt(limit), 100); // ENFORCE max limit
  
  const results = await db.query.entities.findMany({
    where: cursor ? gt(entities.id, cursor) : undefined,
    limit: maxLimit + 1, // Fetch one extra to detect "hasMore"
    orderBy: [asc(entities.id)],
  });
  
  const hasMore = results.length > maxLimit;
  const data = hasMore ? results.slice(0, -1) : results;
  const nextCursor = hasMore ? data[data.length - 1].id : null;
  
  res.json({ data, nextCursor, hasMore });
});
```

### 2.2 Response Size Limits
- List endpoints: Return only essential fields (id, name, status, timestamps)
- Detail endpoints: Return full object
- NEVER return nested objects in list responses
- Enforce max limit server-side (100 items max)

### 2.3 Background Jobs (DataQueue)
The following operations MUST use DataQueue:
- File imports/exports
- CDR sync and rating
- Bulk updates (>50 records)
- AI processing
- Email sending
- Report generation

```typescript
// REQUIRED: Heavy operations via DataQueue
await storage.createJob({
  type: "import_rates",
  payload: { fileId, carrierId },
  priority: 1,
});
// Return job ID, let UI poll for progress
res.json({ jobId, status: "processing" });
```

---

## 3. Database Performance Rules

### 3.1 Required Indexes
Every table MUST have indexes for:
- Primary lookup fields (id, uuid)
- Foreign key relationships
- Common filter combinations
- Ordering fields

```sql
-- REQUIRED index patterns
CREATE INDEX idx_entity_tenant_status ON entities(tenant_id, status);
CREATE INDEX idx_entity_tenant_created ON entities(tenant_id, created_at);
CREATE INDEX idx_entity_tenant_name ON entities(tenant_id, name);
CREATE INDEX idx_entity_status_updated ON entities(status, updated_at);
```

### 3.2 Search Strategy
- For simple search: Use `ILIKE` with GIN trigram index
- For complex search: Use PostgreSQL full-text search
- NEVER use `LIKE '%term%'` without proper indexing

```sql
-- Enable trigram for fast ILIKE
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_entity_name_trgm ON entities USING gin(name gin_trgm_ops);
```

### 3.3 Query Optimization
- Always use `LIMIT` in queries
- Avoid `SELECT *` - specify only needed columns
- Use `EXPLAIN ANALYZE` for slow queries
- Add compound indexes for common filter+order combinations

---

## 4. Caching Rules (Redis/Upstash)

### 4.1 What to Cache
- Session data (already implemented)
- Sidebar counts and summaries
- User permissions snapshot
- Feature flags
- Frequently accessed small lookups
- Rate limits

### 4.2 What NOT to Cache
- Entire database tables
- Large objects (>10KB)
- Rapidly changing data
- User-specific detailed data

### 4.3 Cache Patterns
```typescript
// REQUIRED: Cache with TTL
const cacheKey = `sidebar:counts:${userId}`;
let counts = await redis.get(cacheKey);
if (!counts) {
  counts = await computeSidebarCounts(userId);
  await redis.set(cacheKey, counts, { ex: 60 }); // 60 second TTL
}
return counts;
```

---

## 5. File Storage Rules (R2)

### 5.1 All File Operations via R2
- Upload files to R2 first
- Store only R2 reference in PostgreSQL
- Use presigned URLs for downloads
- Process files via DataQueue jobs

### 5.2 Never Block API on Files
```typescript
// REQUIRED pattern for file uploads
app.post("/api/upload", async (req, res) => {
  const fileKey = await uploadToR2(req.file);
  const jobId = await storage.createJob({
    type: "process_file",
    payload: { fileKey },
  });
  res.json({ jobId, status: "processing" });
});
```

---

## 6. Performance Guardrails

### 6.1 Mandatory Tests
- Dashboard load time < 2 seconds
- List API response < 500ms
- Detail API response < 200ms
- No N+1 queries in any endpoint

### 6.2 Logging Requirements
- Log slow queries (>500ms)
- Log slow API endpoints (>1s)
- Monitor Redis cache hit/miss ratio

### 6.3 Code Review Checklist
Before completing any task, verify:
- [ ] All useQuery calls have staleTime
- [ ] All list APIs use cursor pagination
- [ ] All list APIs enforce max limit
- [ ] Required indexes exist for new columns
- [ ] Heavy operations use DataQueue
- [ ] No synchronous file processing
- [ ] Large lists use virtualization

---

## 7. Performance Compliance Verification

The agent MUST include in every task completion:
```
PERFORMANCE CHECK:
- [ ] staleTime on queries: YES/NO/N/A
- [ ] Cursor pagination: YES/NO/N/A
- [ ] Indexes added: YES/NO/N/A
- [ ] DataQueue for heavy ops: YES/NO/N/A
- [ ] Virtualization for large lists: YES/NO/N/A
```

---

## Quick Reference

| Operation | Required Pattern |
|-----------|-----------------|
| Any useQuery | staleTime + keepPreviousData |
| List API | Cursor pagination + max limit |
| Create/Update | Optimistic UI |
| Large table | Virtualization |
| File upload | R2 + DataQueue |
| Bulk operation | DataQueue |
| Counts/summaries | Redis cache |
| New DB column | Add index if filtered/ordered |

---

**VIOLATION OF THESE RULES IS NOT PERMITTED.**
**ALL NEW CODE MUST COMPLY BEFORE TASK COMPLETION.**
