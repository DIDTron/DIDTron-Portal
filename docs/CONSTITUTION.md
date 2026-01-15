# PROJECT CONSTITUTION (NON-NEGOTIABLE)

This is the supreme governance document. Every AI agent session MUST read and obey these rules.

## RULE 1 — MODULARIZATION
- `routes.ts` is AGGREGATOR ONLY (mount module routers). No endpoints, no logic, no DB calls inside routes.ts.
- Every module must have its own router file: `server/routes/<module>.routes.ts`
- Frontend module pages live in `client/src/pages/<module>/` (or a single module entry file if already established).

## RULE 2 — DATA REQUEST DISCIPLINE
- Every `useQuery` MUST include an explicit `enabled:` condition unless it is a tiny always-needed list.
- For tabs: ONLY the active tab is allowed to fetch. Inactive tabs must fetch NOTHING.
- For dialogs: dialog dropdown queries fetch ONLY when dialog is open.

## RULE 3 — SCALABILITY
- Any list that can grow MUST use cursor pagination (cursor+limit). Offset pagination is forbidden.
- Any table that can exceed 300 rows MUST be virtualized.

## RULE 4 — EXTERNAL INTEGRATIONS (ConnexCS or any external)
- UI NEVER calls external systems directly.
- UI READS from Postgres control plane only.
- External WRITES happen ONLY via job/command pattern returning `{jobId}` + progress UI.
- Add TTL caching (60–120s) for external read endpoints used as dropdowns.

## RULE 5 — METRICS MUST BE TRUTHFUL
- API metrics record ONLY `/api/*` (exclude `/src/*`, assets, `/`, and internal metrics endpoints).
- DEV must not spam DB with metrics inserts (dev interval must be slower than prod).

## RULE 6 — PROOF-DRIVEN DEVELOPMENT
You may NOT claim "done/fixed/faster" without proof:
- Paste code diff snippets (file+line numbers)
- Paste network proof (which endpoints fire)
- Paste before/after metrics numbers

## RULE 7 — WORKFLOW (NO DRIFT)
For every task:
1. Restate the task in 1 line.
2. Show the exact files you will change (list).
3. Implement.
4. Provide proof outputs.
5. STOP and wait.

If you are unsure: STOP and ask. Do NOT invent.
