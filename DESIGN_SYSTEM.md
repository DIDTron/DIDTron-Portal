# DIDTron Design System (DDS)
## Single Source of Truth for All UI/UX

**Version:** 1.0.0  
**Last Updated:** January 8, 2026  
**Status:** Active

---

## THE GOLDEN RULE

```
Before building ANY UI element:
1. Check if it exists in this document
2. If YES → Use exactly as documented
3. If NO → Add it here FIRST, then use it
```

---

## Table of Contents

1. [Design Tokens](#1-design-tokens)
2. [Component Library](#2-component-library)
3. [Layout Patterns](#3-layout-patterns)
4. [Page Templates](#4-page-templates)
5. [Portal Themes](#5-portal-themes)
6. [Interaction Standards](#6-interaction-standards)
7. [Data Display Patterns](#7-data-display-patterns)
8. [Form Patterns](#8-form-patterns)
9. [Accessibility Requirements](#9-accessibility-requirements)
10. [Testing Standards](#10-testing-standards)
11. [Design Principles](#11-design-principles)
12. [Marketing Website Structure](#12-marketing-website-structure)
13. [Dashboard-Specific Elements](#13-dashboard-specific-elements)
14. [Responsive Behavior](#14-responsive-behavior)
15. [Animation Guidelines](#15-animation-guidelines)

---

## 1. Design Tokens

### 1.1 Color System

#### Primary Colors (DIDTron Blue)
| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--primary` | `217 91% 48%` (#1d4ed8) | `217 91% 48%` | Primary actions, links, active states |
| `--primary-foreground` | `0 0% 100%` | `0 0% 100%` | Text on primary backgrounds |

> **Accessibility Note**: Primary blue adjusted from 60% to 48% lightness (2026-01-15) to meet WCAG 2.0 AA 4.5:1 contrast with white foreground. See docs/DECISIONS.md.

#### Semantic Colors
| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--background` | `210 20% 98%` | `222 47% 5%` | Page background |
| `--foreground` | `222 47% 11%` | `210 20% 98%` | Primary text |
| `--muted` | `210 20% 96%` | `217 33% 12%` | Subdued backgrounds |
| `--muted-foreground` | `215 16% 47%` | `215 16% 57%` | Secondary text |
| `--accent` | `214 95% 93%` | `217 91% 15%` | Highlights, selected states |
| `--destructive` | `0 84% 60%` | `0 72% 51%` | Error states, delete actions |

#### Surface Colors
| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--card` | `0 0% 100%` | `222 47% 8%` | Card backgrounds |
| `--sidebar` | `210 20% 98%` | `222 47% 8%` | Sidebar backgrounds |
| `--popover` | `0 0% 100%` | `222 47% 8%` | Dropdown/modal backgrounds |

#### Chart Colors
| Token | Color | Usage |
|-------|-------|-------|
| `--chart-1` | Blue #1d4ed8 | Primary metric (accessibility-adjusted) |
| `--chart-2` | Green #10B981 | Success/positive |
| `--chart-3` | Yellow #F59E0B | Warning/attention |
| `--chart-4` | Purple #8B5CF6 | Tertiary data |
| `--chart-5` | Pink #EC4899 | Quaternary data |

#### Status Colors
| Status | Color | Usage |
|--------|-------|-------|
| `status-online` | `rgb(34 197 94)` | Active, online, success |
| `status-away` | `rgb(245 158 11)` | Warning, pending |
| `status-busy` | `rgb(239 68 68)` | Error, busy, offline |
| `status-offline` | `rgb(156 163 175)` | Inactive, disabled |

### 1.2 Typography

#### Font Families
| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | Inter, Open Sans, system-ui | Body text, UI elements |
| `--font-serif` | Georgia, serif | Reserved for special content |
| `--font-mono` | Menlo, Monaco, monospace | Code, SIP addresses, IPs |

#### Font Sizes
| Class | Size | Usage |
|-------|------|-------|
| `text-xs` | 12px | Badges, captions |
| `text-sm` | 14px | Secondary text, table cells |
| `text-base` | 16px | Body text, inputs |
| `text-lg` | 18px | Subheadings |
| `text-xl` | 20px | Section titles |
| `text-2xl` | 24px | Card titles |
| `text-3xl` | 30px | Page titles |
| `text-4xl` | 36px | Hero headings, KPI values |

#### Font Weights
| Weight | Class | Usage |
|--------|-------|-------|
| 400 | `font-normal` | Body text |
| 500 | `font-medium` | Labels, buttons |
| 600 | `font-semibold` | Headings, emphasis |
| 700 | `font-bold` | Strong emphasis |

### 1.3 Spacing

#### Base Unit: 4px (0.25rem)
| Token | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Tight inline spacing |
| `gap-2` | 8px | Icon-text spacing |
| `gap-3` | 12px | Related elements |
| `gap-4` | 16px | Standard spacing |
| `gap-6` | 24px | Section spacing |
| `gap-8` | 32px | Large section spacing |

#### Padding Standards
| Context | Padding | Class |
|---------|---------|-------|
| Card | 24px | `p-6` |
| Table cell | 16px x 12px | `px-4 py-3` |
| Button default | 16px x 8px | `px-4 py-2` |
| Input | 16px x 12px | `px-4 py-3` |
| Page content | 24px | `p-6` |

### 1.4 Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 3px | Small elements |
| `rounded-md` | 6px | Buttons, inputs, badges |
| `rounded-lg` | 9px | Cards, modals |
| `rounded-xl` | 12px | Large containers |
| `rounded-full` | 9999px | Avatars, pills |

### 1.5 Shadows
| Token | Usage |
|-------|-------|
| `shadow-xs` | Buttons |
| `shadow-sm` | Cards (light) |
| `shadow-md` | Dropdowns, popovers |
| `shadow-lg` | Modals |
| `shadow-xl` | Floating elements |

---

## 2. Component Library

### 2.1 Button

**Import:** `import { Button } from "@/components/ui/button"`

#### Variants
| Variant | Usage | Example |
|---------|-------|---------|
| `default` | Primary actions | Save, Submit, Create |
| `secondary` | Secondary actions | Cancel, Back |
| `destructive` | Destructive actions | Delete, Remove |
| `outline` | Tertiary actions | Export, Filter |
| `ghost` | Minimal actions | Icon buttons, inline actions |

#### Sizes
| Size | Height | Usage |
|------|--------|-------|
| `default` | min-h-9 (36px) | Standard buttons |
| `sm` | min-h-8 (32px) | Compact layouts |
| `lg` | min-h-10 (40px) | Hero CTAs |
| `icon` | 36x36px | Icon-only buttons |

#### Rules
- NEVER add custom `h-*` or `w-*` to buttons
- NEVER add custom hover/active states
- For icon buttons, ALWAYS use `size="icon"`
- Buttons on same row MUST have same size

#### Examples
```tsx
// Primary action
<Button data-testid="button-save">Save Changes</Button>

// Icon button
<Button size="icon" variant="ghost" data-testid="button-delete">
  <Trash className="h-4 w-4" />
</Button>

// With loading state
<Button disabled={isPending}>
  {isPending ? "Saving..." : "Save"}
</Button>
```

### 2.2 Card

**Import:** `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"`

#### Structure
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between gap-4">
    <div>
      <CardTitle>Title</CardTitle>
      <CardDescription>Description</CardDescription>
    </div>
    <Button>Action</Button>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>
```

#### Rules
- NEVER nest Card inside Card
- NEVER use Card as full-width sidebar
- CardHeader with `justify-between` MUST have `gap-*`
- Use Card for grouping related content only

### 2.3 Badge

**Import:** `import { Badge } from "@/components/ui/badge"`

#### Variants
| Variant | Usage |
|---------|-------|
| `default` | Primary status (blue) |
| `secondary` | Neutral status |
| `destructive` | Error/warning status |
| `outline` | Subtle status |

#### Status Badge Patterns
```tsx
// Status indicators
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Failed</Badge>
<Badge variant="outline">Draft</Badge>
```

#### Rules
- NEVER add custom width/height
- Place in containers with sufficient width
- Use for status, counts, or labels only

### 2.4 DataTableFooter (Pagination)

**Import:** `import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer"`

#### Usage Pattern
```tsx
const {
  currentPage,
  pageSize,
  totalPages,
  totalItems,
  paginatedItems,
  onPageChange,
  onPageSizeChange,
} = useDataTablePagination(filteredData, 10);

// In JSX after Table:
<DataTableFooter
  currentPage={currentPage}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={totalItems}
  onPageChange={onPageChange}
  onPageSizeChange={onPageSizeChange}
/>
```

#### Features
- Rows per page: 10, 25, 50, 100
- "Showing X-Y of Z" text
- Previous/Next navigation
- Direct page number input
- Auto-resets page on filter changes

#### Rules
- EVERY data table MUST include DataTableFooter
- Place immediately after `</Table>` element
- Use `paginatedItems` for table rows, not original array

### 2.5 Table

**Import:** `import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"`

#### Standard Structure
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {paginatedItems.map((item) => (
      <TableRow key={item.id} data-testid={`row-item-${item.id}`}>
        <TableCell>{item.name}</TableCell>
        <TableCell>{item.value}</TableCell>
        <TableCell className="text-right">
          <Button size="icon" variant="ghost">
            <Edit className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
<DataTableFooter {...paginationProps} />
```

### 2.6 Form Components

#### Input
```tsx
<Input
  type="text"
  placeholder="Enter value"
  data-testid="input-name"
/>
```

#### Select
```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger data-testid="select-status">
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="inactive">Inactive</SelectItem>
  </SelectContent>
</Select>
```

#### Rules
- SelectItem MUST have `value` prop
- Inputs MUST have `data-testid`
- Use `zodResolver` for form validation

### 2.7 Dialog (Modal)

**Import:** `import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"`

#### Standard Structure
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Description text</DialogDescription>
    </DialogHeader>
    <div className="py-4">
      {/* Content */}
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={handleSubmit}>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 2.8 Tabs

**Import:** `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"`

#### Standard Structure
```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1" data-testid="tab-overview">Overview</TabsTrigger>
    <TabsTrigger value="tab2" data-testid="tab-details">Details</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">
    {/* Tab 1 content */}
  </TabsContent>
  <TabsContent value="tab2">
    {/* Tab 2 content */}
  </TabsContent>
</Tabs>
```

---

## 3. Layout Patterns

### 3.1 VitalPBX-Style Layout

The platform uses a dual-sidebar layout with workspace tabs:

```
┌──────────────────────────────────────────────────────────┐
│  Global Header (Search, Notifications, User)             │
├────┬──────────────┬──────────────────────────────────────┤
│    │              │  Workspace Tabs                      │
│ I  │  Secondary   ├──────────────────────────────────────┤
│ C  │  Sidebar     │                                      │
│ O  │              │  Main Content Area                   │
│ N  │  (Submenu)   │                                      │
│    │              │                                      │
│ R  │              │                                      │
│ A  │              │                                      │
│ I  │              ├──────────────────────────────────────┤
│ L  │              │  Action Dock (Fixed bottom)          │
└────┴──────────────┴──────────────────────────────────────┘
```

#### Icon Rail (Primary Sidebar)
- Width: 64px collapsed
- Contains module icons only
- Highlights active module

#### Secondary Sidebar
- Width: 240px
- Contains submenu items for active module
- Grouped by category

#### Main Content
- Flexible width
- Contains workspace tabs at top
- Action dock fixed at bottom

### 3.2 Page Layout Classes

```tsx
// Standard page wrapper
<div className="flex flex-col h-full">
  <div className="flex items-center justify-between gap-4 p-6 border-b">
    <div>
      <h1 className="text-2xl font-semibold">Page Title</h1>
      <p className="text-sm text-muted-foreground">Description</p>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="outline">Export</Button>
      <Button>Add New</Button>
    </div>
  </div>
  <div className="flex-1 overflow-auto p-6">
    {/* Content */}
  </div>
</div>
```

### 3.3 Horizontal Overflow Rules

**CRITICAL**: Never allow horizontal content (tabs, button groups, filter rows) to wrap awkwardly when sidebars are open.

#### Tab Navigation
Always use horizontal scrolling for tab lists with many items:

```tsx
// CORRECT: Tabs scroll horizontally, never wrap
<Tabs value={tab} onValueChange={setTab}>
  <div className="overflow-x-auto">
    <TabsList className="inline-flex w-max">
      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
      <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      {/* More tabs... */}
    </TabsList>
  </div>
</Tabs>

// WRONG: Tabs wrap to multiple lines
<TabsList className="flex-wrap">
  {/* This causes ugly wrapping when space is limited */}
</TabsList>
```

#### Horizontal Button Groups
```tsx
// CORRECT: Button groups scroll if needed
<div className="overflow-x-auto">
  <div className="inline-flex gap-2 w-max">
    <Button>Action 1</Button>
    <Button>Action 2</Button>
    {/* More buttons... */}
  </div>
</div>
```

#### Filter Rows
```tsx
// CORRECT: Filters wrap gracefully with proper spacing
<div className="flex items-center gap-4 flex-wrap">
  {/* Filter controls */}
</div>
```

---

## 4. Page Templates

### 4.1 List Page Template

Used for: Carriers, Customers, Routes, DIDs, etc.

```tsx
export default function ListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ['/api/items'] });
  
  const filteredData = useMemo(() => {
    return data?.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }, [data, searchQuery]);
  
  const pagination = useDataTablePagination(filteredData, 10);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold">Items</h1>
          <p className="text-sm text-muted-foreground">Manage your items</p>
        </div>
        <Button data-testid="button-add-item">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 border-b">
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
          data-testid="input-search"
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          {/* Table content using pagination.paginatedItems */}
        </Table>
        <DataTableFooter {...pagination} />
      </div>
    </div>
  );
}
```

### 4.2 Form Page Template

Used for: Add/Edit screens

```tsx
export default function FormPage() {
  const form = useForm({
    resolver: zodResolver(insertSchema),
    defaultValues: { name: "", status: "active" }
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 p-6 border-b">
        <h1 className="text-2xl font-semibold">Add Item</h1>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-4">
              <Button type="submit" data-testid="button-submit">Save</Button>
              <Button type="button" variant="outline">Cancel</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
```

### 4.3 Dashboard Template

Used for: Overview pages with KPIs and charts

```tsx
export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          {/* More KPI cards */}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Volume</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Chart component */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. Portal Themes

### 5.1 Theme Configuration

Each portal has its own accent color while sharing the same base tokens:

| Portal | Primary Accent | Sidebar Accent | Badge Default |
|--------|---------------|----------------|---------------|
| Super Admin | Blue #2563EB | Blue | Blue |
| Customer | Green #10B981 | Green | Green |
| Carrier | Teal #14B8A6 | Teal | Teal |
| Class 4 | Purple #8B5CF6 | Purple | Purple |

### 5.2 Theme Switching

Portal themes are applied via CSS custom properties at the root level:

```css
/* Customer Portal Theme */
.portal-customer {
  --primary: 160 84% 39%;
  --accent: 160 84% 93%;
  --sidebar-primary: 160 84% 39%;
}
```

### 5.3 White-Label Overrides

Per-customer branding overrides these tokens:
- `--primary` (brand color)
- `--logo-url` (logo image)
- `--favicon-url` (favicon)
- Feature visibility flags

---

## 6. Interaction Standards

### 6.1 Elevation System

The platform uses a custom elevation system for hover/active states:

| Class | Effect | Usage |
|-------|--------|-------|
| `hover-elevate` | Subtle brightness on hover | Cards, list items |
| `active-elevate-2` | More brightness on click | Buttons, badges |
| `toggle-elevate` | Toggle background state | Toggle buttons |

#### Rules
- Button and Badge have these built-in - NEVER add custom hover states
- Does NOT work with `overflow-hidden`
- Works with any background color

### 6.2 Loading States

```tsx
// Query loading
if (isLoading) {
  return <div className="p-6"><Skeleton className="h-8 w-full" /></div>;
}

// Button loading
<Button disabled={mutation.isPending}>
  {mutation.isPending ? "Saving..." : "Save"}
</Button>
```

### 6.3 Empty States

```tsx
{data.length === 0 && (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <FileX className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold">No items found</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Get started by creating your first item.
    </p>
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Add Item
    </Button>
  </div>
)}
```

### 6.4 Error States

```tsx
{isError && (
  <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-md">
    <AlertCircle className="h-4 w-4" />
    <span>Failed to load data. Please try again.</span>
  </div>
)}
```

---

## 7. Data Display Patterns

### 7.1 Status Indicators

```tsx
// Dot indicator
<span className="flex items-center gap-2">
  <span className="h-2 w-2 rounded-full bg-status-online" />
  Active
</span>

// Badge indicator
<Badge variant="default">Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Failed</Badge>
```

### 7.2 Monetary Values

```tsx
// Always use consistent formatting
<span className="font-mono">${amount.toFixed(2)}</span>

// With currency
<span className="font-mono">USD {amount.toFixed(4)}</span>
```

### 7.3 Dates and Times

```tsx
import { format } from "date-fns";

// Standard date
{format(new Date(item.createdAt), "MMM d, yyyy")}

// With time
{format(new Date(item.createdAt), "MMM d, yyyy HH:mm")}

// Relative time
{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
```

### 7.4 Phone Numbers

```tsx
// Always use monospace for technical data
<span className="font-mono">+1 (555) 123-4567</span>
```

---

## 8. Form Patterns

### 8.1 Form Validation

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertItemSchema } from "@shared/schema";

const form = useForm({
  resolver: zodResolver(insertItemSchema.extend({
    name: z.string().min(2, "Name must be at least 2 characters"),
  })),
  defaultValues: {
    name: "",
    status: "active",
  },
});
```

### 8.2 Form Field Layout

```tsx
// Single column (default)
<div className="space-y-4">
  <FormField ... />
  <FormField ... />
</div>

// Two column
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <FormField ... />
  <FormField ... />
</div>
```

### 8.3 Confirmation Dialogs

For destructive actions, require explicit confirmation:

```tsx
// Delete confirmation
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. Type DELETE to confirm.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <Input 
      value={confirmText}
      onChange={(e) => setConfirmText(e.target.value)}
      placeholder="Type DELETE to confirm"
    />
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction 
        disabled={confirmText !== "DELETE"}
        onClick={handleDelete}
      >
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 9. Accessibility Requirements

### 9.1 Focus States

All interactive elements must have visible focus indicators:
```tsx
focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
```

### 9.2 Color Contrast

- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### 9.3 Keyboard Navigation

All features must be accessible via keyboard:
- Tab for navigation
- Enter/Space for activation
- Escape for closing modals
- Arrow keys for menus/selects

### 9.4 Screen Reader Labels

```tsx
// Icon buttons
<Button size="icon" aria-label="Delete item">
  <Trash className="h-4 w-4" />
</Button>

// Status indicators
<span className="sr-only">Status: Active</span>
<span className="h-2 w-2 rounded-full bg-status-online" aria-hidden="true" />
```

---

## 10. Testing Standards

### 10.1 data-testid Conventions

ALL interactive and meaningful elements MUST have `data-testid`:

| Element Type | Pattern | Example |
|--------------|---------|---------|
| Button | `button-{action}` | `button-save`, `button-delete` |
| Input | `input-{field}` | `input-email`, `input-search` |
| Select | `select-{field}` | `select-status`, `select-country` |
| Link | `link-{destination}` | `link-profile`, `link-settings` |
| Row | `row-{type}-{id}` | `row-carrier-123` |
| Card | `card-{type}-{id}` | `card-kpi-revenue` |
| Tab | `tab-{name}` | `tab-overview`, `tab-settings` |
| Badge | `badge-{type}` | `badge-status`, `badge-count` |

### 10.2 Dynamic IDs

```tsx
// For lists/tables
{items.map((item, index) => (
  <TableRow key={item.id} data-testid={`row-item-${item.id}`}>
    ...
  </TableRow>
))}
```

---

## Component Inventory Status

This section tracks all components and their adoption status across the platform:

| Component | Status | Used In | Notes |
|-----------|--------|---------|-------|
| Button | ✅ Adopted | All modules | Standard across platform |
| Card | ✅ Adopted | All modules | Standard across platform |
| Badge | ✅ Adopted | All modules | Standard across platform |
| DataTableFooter | ✅ Adopted | 30+ modules | Added January 2026 |
| Table | ✅ Adopted | All list pages | Standard across platform |
| Dialog | ✅ Adopted | All modules | Standard across platform |
| Form | ✅ Adopted | All forms | With zodResolver |
| Tabs | ✅ Adopted | Config pages | Standard across platform |
| Select | ✅ Adopted | All forms | Standard across platform |
| Input | ✅ Adopted | All forms | Standard across platform |

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-11 | 1.1.0 | Merged design_guidelines.md content - Marketing, Responsive, Animation sections |
| 2026-01-08 | 1.0.0 | Initial release - Complete design system documentation |

---

## 11. Design Principles

**Enterprise SaaS Dashboard System**: Professional B2B wholesale VoIP platform combining Stripe's enterprise polish with Linear's information density.

### Core Principles
- **Enterprise-grade professionalism**: Trustworthy, polished, telecommunications-focused
- **Information density**: Dashboard-first layouts optimizing for data visibility
- **Portal differentiation**: Subtle accent variations maintaining brand cohesion
- **Dark mode native**: Designed for extended monitoring sessions

---

## 12. Marketing Website Structure

### 12.1 Hero Section
**Full-width split layout**:
- Left (50%): Bold headline "Enterprise VoIP Wholesale Platform", subheading, two CTAs ("Start Free Trial" + "View Pricing"), trust line
- Right (50%): Large dashboard screenshot showing real-time call metrics
- Height: min-h-[700px] with gradient overlay background
- Include subtle grid pattern background

### 12.2 Platform Capabilities (3-column grid)
Cards showcasing:
- Wholesale voice termination
- DID number management
- Real-time call routing
- Carrier interconnection
- Billing & invoicing automation
- Advanced analytics & reporting

Each card: Icon (24px), title, 2-line description, underline link

### 12.3 Portal Showcase (4-column)
Visual cards for each portal with screenshots:
- Customer portal preview
- Carrier portal preview
- Admin portal preview
- API documentation portal

### 12.4 Pricing Table
3-tier comparison (Starter, Professional, Enterprise):
- Feature checkmarks per tier
- Prominent CTAs
- "Contact Sales" for Enterprise

### 12.5 Footer
4-column layout:
- Company info + logo
- Products (Portal links)
- Resources (Docs, API, Status Page)
- Contact (Support, Sales, Social links)
- Bottom bar: Copyright, legal links

---

## 13. Dashboard-Specific Elements

### 13.1 Metrics Display
- Large number typography for KPIs (text-4xl font-bold)
- Percentage changes with color indicators (+green, -red)
- Time range selectors (24h, 7d, 30d, Custom)

### 13.2 Status Indicators
- Online/Offline dots: 8px rounded-full
- Health status: Green/Yellow/Red with labels
- Real-time badges: "LIVE" pulsing indicator

### 13.3 Data Visualization
- Line charts for call volume trends
- Bar charts for geographic distribution
- Donut charts for resource utilization
- Heatmaps for peak traffic periods

---

## 14. Responsive Behavior

| Breakpoint | Layout | Notes |
|------------|--------|-------|
| Desktop (≥1024px) | Multi-column dashboards, side-by-side data views | Full feature set |
| Tablet (768-1023px) | 2-column maximum, stacked cards | Reduced sidebars |
| Mobile (<768px) | Single column, collapsible tables, bottom sheet filters | Hamburger menu |

### Mobile Navigation
- Hamburger menu with slide-out drawer
- Bottom navigation for primary actions
- Collapsible table views

---

## 15. Animation Guidelines

**Rule**: Minimal and purposeful only

| Animation | Usage | Duration |
|-----------|-------|----------|
| Fade-in on scroll | Marketing sections only | 300ms |
| Number counting | Statistics/KPIs on load | 500ms |
| Skeleton loading | Dashboard data loading | Until data loads |
| Interactive transitions | Hover/focus states | 150ms |

**Forbidden**:
- Decorative animations
- Parallax effects
- Auto-playing carousels
- Bouncing/wiggling elements

---

## Contribution Guidelines

### Adding New Components

1. Document in this file FIRST
2. Add to Component Inventory with status
3. Define all variants and usage rules
4. Include code examples
5. Add data-testid conventions
6. Update changelog

### Modifying Existing Components

1. Update this file with changes
2. Verify backward compatibility
3. Update all affected modules
4. Update changelog with date and version
