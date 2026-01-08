# UI Debt Backlog

**Last Updated:** January 8, 2026  
**Status:** Active Tracking

---

## Current CMS Modules (TO BE DELETED)

These modules will be replaced by the new Experience Manager:

| File | Status | Replacement |
|------|--------|-------------|
| `cms-pages.tsx` | DELETE | Experience Manager → Marketing Website → Landing Pages |
| `website-sections.tsx` | DELETE | Experience Manager → Marketing Website → Page Builder |
| `portal-login-pages.tsx` | DELETE | Experience Manager → White-Label → Login Pages |
| `site-settings.tsx` | DELETE | Experience Manager → Design System → Site Config |
| `cms-themes.tsx` | DELETE | Experience Manager → Portal Themes |
| `media-library.tsx` | DELETE | Experience Manager → Marketing Website → Media Library |
| `documentation.tsx` | KEEP | Move to Experience Manager → Marketing Website → Documentation |

---

## Component Adoption Status

| Component | Status | Modules Using | Action Needed |
|-----------|--------|---------------|---------------|
| DataTableFooter | Adopted | 30+ | None |
| Button | Adopted | All | None |
| Card | Adopted | All | None |
| Badge | Adopted | All | None |
| Table | Adopted | All | None |
| Dialog | Adopted | All | None |
| Tabs | Adopted | Config pages | None |

---

## Identified Inconsistencies

### 1. Page Header Patterns
Some pages use different header structures:
- Most pages: `<div className="p-6 space-y-6">` with inline header
- Some pages: `<div className="flex flex-col h-full">` with proper header

**Action:** Standardize to `flex flex-col h-full` pattern

### 2. Loading States
- Most pages: `<Loader2>` spinner
- Some pages: `<Skeleton>` components

**Action:** Use `<Skeleton>` for initial load, `<Loader2>` for actions

### 3. Empty States
- Inconsistent empty state messaging and styling

**Action:** Create standard EmptyState component

### 4. Form Validation
- Some pages use inline validation
- Some pages use react-hook-form with zodResolver

**Action:** Standardize to react-hook-form with zodResolver

---

## Migration Priority

### High Priority (Delete & Rebuild)
1. All CMS modules → Experience Manager

### Medium Priority (Refactor)
2. Standardize page headers across all modules
3. Implement consistent loading/empty states

### Low Priority (Enhancement)
4. Add missing data-testid attributes
5. Improve accessibility labels

---

## Experience Manager Structure (NEW)

```
Experience Manager (Replaces CMS)
├── Marketing Website
│   ├── Landing Pages (page builder)
│   ├── Blog Posts
│   ├── Documentation
│   └── Media Library
├── Portal Themes
│   ├── Super Admin Theme
│   ├── Customer Portal Theme
│   ├── Carrier Portal Theme
│   └── Class 4 Portal Theme
├── White-Label
│   ├── Customer Brands
│   ├── Custom Domains
│   └── Login Pages
└── Design System
    ├── Component Inventory
    ├── Design Tokens
    ├── UI Health Score
    └── Publish History
```

---

## Changelog

| Date | Action |
|------|--------|
| 2026-01-08 | Initial audit completed |
| 2026-01-08 | CMS modules marked for deletion |
| 2026-01-08 | Experience Manager structure defined |
