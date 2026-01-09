import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { 
  Search, Copy, Check, Plus, Trash2, Edit, MoreHorizontal, 
  ChevronRight, Settings, User, Bell, LogOut, Layers, Terminal,
  AlertCircle, ChevronDown, Bold, Italic, Underline, Home, ChevronsUpDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ComponentExample {
  name: string;
  description: string;
  category: "inputs" | "display" | "feedback" | "navigation" | "layout" | "overlay";
  variants?: string[];
  code: string;
  preview: JSX.Element;
}

const componentExamples: ComponentExample[] = [
  {
    name: "Button",
    description: "Interactive button with multiple variants and sizes. Never add custom hover states - they're built-in.",
    category: "inputs",
    variants: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    code: `<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="icon"><Plus /></Button>`,
    preview: (
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="default" data-testid="preview-button-default">Default</Button>
        <Button variant="destructive" data-testid="preview-button-destructive">Destructive</Button>
        <Button variant="outline" data-testid="preview-button-outline">Outline</Button>
        <Button variant="secondary" data-testid="preview-button-secondary">Secondary</Button>
        <Button variant="ghost" data-testid="preview-button-ghost">Ghost</Button>
        <Button size="sm" data-testid="preview-button-sm">Small</Button>
        <Button size="icon" data-testid="preview-button-icon"><Plus className="h-4 w-4" /></Button>
      </div>
    ),
  },
  {
    name: "Badge",
    description: "Small status indicators. Use for tags, labels, and counts. Never add hover states - they're built-in.",
    category: "display",
    variants: ["default", "secondary", "destructive", "outline"],
    code: `<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>`,
    preview: (
      <div className="flex flex-wrap items-center gap-2">
        <Badge data-testid="preview-badge-default">Default</Badge>
        <Badge variant="secondary" data-testid="preview-badge-secondary">Secondary</Badge>
        <Badge variant="destructive" data-testid="preview-badge-destructive">Destructive</Badge>
        <Badge variant="outline" data-testid="preview-badge-outline">Outline</Badge>
      </div>
    ),
  },
  {
    name: "Input",
    description: "Text input field for forms. Use with Label for accessibility.",
    category: "inputs",
    code: `<Input placeholder="Enter text..." />
<Input type="email" placeholder="Email" />
<Input disabled placeholder="Disabled" />`,
    preview: (
      <div className="flex flex-col gap-2 max-w-sm">
        <Input placeholder="Enter text..." data-testid="preview-input-text" />
        <Input type="email" placeholder="Email" data-testid="preview-input-email" />
        <Input disabled placeholder="Disabled" data-testid="preview-input-disabled" />
      </div>
    ),
  },
  {
    name: "Card",
    description: "Container component for grouping related content. Use hover-elevate for interactive cards.",
    category: "layout",
    code: `<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>`,
    preview: (
      <Card className="max-w-sm" data-testid="preview-card">
        <CardHeader>
          <CardTitle data-testid="preview-card-title">Card Title</CardTitle>
          <CardDescription>Card description goes here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">This is the card content area.</p>
        </CardContent>
      </Card>
    ),
  },
  {
    name: "Select",
    description: "Dropdown selection component. Always provide a value prop to SelectItem.",
    category: "inputs",
    code: `<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>`,
    preview: (
      <Select>
        <SelectTrigger className="w-48" data-testid="preview-select-trigger">
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1" data-testid="preview-select-option1">Option 1</SelectItem>
          <SelectItem value="option2" data-testid="preview-select-option2">Option 2</SelectItem>
          <SelectItem value="option3" data-testid="preview-select-option3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  {
    name: "Checkbox",
    description: "Toggle for boolean values. Use with Label for accessibility.",
    category: "inputs",
    code: `<div className="flex items-center gap-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms</Label>
</div>`,
    preview: (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Checkbox id="ex1" data-testid="preview-checkbox-unchecked" />
          <Label htmlFor="ex1">Accept terms and conditions</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="ex2" defaultChecked data-testid="preview-checkbox-checked" />
          <Label htmlFor="ex2">Checked by default</Label>
        </div>
      </div>
    ),
  },
  {
    name: "Switch",
    description: "Toggle switch for on/off states.",
    category: "inputs",
    code: `<div className="flex items-center gap-2">
  <Switch id="notifications" />
  <Label htmlFor="notifications">Notifications</Label>
</div>`,
    preview: (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Switch id="s1" data-testid="preview-switch-off" />
          <Label htmlFor="s1">Enable notifications</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="s2" defaultChecked data-testid="preview-switch-on" />
          <Label htmlFor="s2">Dark mode</Label>
        </div>
      </div>
    ),
  },
  {
    name: "Tabs",
    description: "Tab navigation for switching between views. Add aria-label for accessibility.",
    category: "navigation",
    code: `<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>`,
    preview: (
      <Tabs defaultValue="tab1" className="w-full max-w-md">
        <TabsList aria-label="Example tabs">
          <TabsTrigger value="tab1" aria-label="First tab" data-testid="preview-tab-account">Account</TabsTrigger>
          <TabsTrigger value="tab2" aria-label="Second tab" data-testid="preview-tab-password">Password</TabsTrigger>
          <TabsTrigger value="tab3" aria-label="Third tab" data-testid="preview-tab-settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="p-4">Manage your account settings here.</TabsContent>
        <TabsContent value="tab2" className="p-4">Update your password here.</TabsContent>
        <TabsContent value="tab3" className="p-4">Configure other settings.</TabsContent>
      </Tabs>
    ),
  },
  {
    name: "Avatar",
    description: "User profile image with fallback. Use AvatarFallback for when image is missing.",
    category: "display",
    code: `<Avatar>
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>`,
    preview: (
      <div className="flex items-center gap-4">
        <Avatar data-testid="preview-avatar-jd">
          <AvatarImage src="" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <Avatar data-testid="preview-avatar-ab">
          <AvatarImage src="" />
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
        <Avatar data-testid="preview-avatar-mk">
          <AvatarImage src="" />
          <AvatarFallback>MK</AvatarFallback>
        </Avatar>
      </div>
    ),
  },
  {
    name: "Progress",
    description: "Visual progress indicator. Add aria-label for accessibility.",
    category: "feedback",
    code: `<Progress value={60} aria-label="60% complete" />`,
    preview: (
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Progress value={25} aria-label="25% complete" data-testid="preview-progress-25" />
        <Progress value={60} aria-label="60% complete" data-testid="preview-progress-60" />
        <Progress value={90} aria-label="90% complete" data-testid="preview-progress-90" />
      </div>
    ),
  },
  {
    name: "Slider",
    description: "Range input for selecting values.",
    category: "inputs",
    code: `<Slider defaultValue={[50]} max={100} step={1} />`,
    preview: (
      <div className="w-full max-w-md">
        <Slider defaultValue={[50]} max={100} step={1} data-testid="preview-slider" />
      </div>
    ),
  },
  {
    name: "Textarea",
    description: "Multi-line text input. Never reset padding to zero.",
    category: "inputs",
    code: `<Textarea placeholder="Type your message..." />`,
    preview: (
      <Textarea placeholder="Type your message here..." className="max-w-md" data-testid="preview-textarea" />
    ),
  },
  {
    name: "Dialog",
    description: "Modal dialog for important interactions. Use for forms and confirmations.",
    category: "overlay",
    code: `<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
    preview: (
      <Dialog>
        <DialogTrigger asChild>
          <Button data-testid="preview-dialog-trigger">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Make changes to your profile here.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input placeholder="Name" data-testid="preview-dialog-input" />
          </div>
          <DialogFooter>
            <Button variant="outline" data-testid="preview-dialog-cancel">Cancel</Button>
            <Button data-testid="preview-dialog-save">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
  },
  {
    name: "AlertDialog",
    description: "Confirmation dialog for destructive actions.",
    category: "overlay",
    code: `<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`,
    preview: (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" data-testid="preview-alertdialog-trigger">Delete Item</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="preview-alertdialog-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction data-testid="preview-alertdialog-confirm">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
  },
  {
    name: "Tooltip",
    description: "Hover hint for additional information.",
    category: "overlay",
    code: `<Tooltip>
  <TooltipTrigger asChild>
    <Button size="icon"><Settings /></Button>
  </TooltipTrigger>
  <TooltipContent>Settings</TooltipContent>
</Tooltip>`,
    preview: (
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" data-testid="preview-tooltip-settings"><Settings className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" data-testid="preview-tooltip-profile"><User className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Profile</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline" data-testid="preview-tooltip-notifications"><Bell className="h-4 w-4" /></Button>
          </TooltipTrigger>
          <TooltipContent>Notifications</TooltipContent>
        </Tooltip>
      </div>
    ),
  },
  {
    name: "Popover",
    description: "Floating panel anchored to a trigger element.",
    category: "overlay",
    code: `<Popover>
  <PopoverTrigger asChild>
    <Button>Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    Popover content here
  </PopoverContent>
</Popover>`,
    preview: (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" data-testid="preview-popover-trigger">Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium" data-testid="preview-popover-title">Dimensions</h4>
            <p className="text-sm text-muted-foreground">Set the dimensions for the layer.</p>
          </div>
        </PopoverContent>
      </Popover>
    ),
  },
  {
    name: "DropdownMenu",
    description: "Context menu for actions. Great for overflow menus.",
    category: "navigation",
    code: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button size="icon"><MoreHorizontal /></Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Edit</DropdownMenuItem>
    <DropdownMenuItem>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
    preview: (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="outline" data-testid="preview-dropdown-trigger"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem data-testid="preview-dropdown-edit"><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
          <DropdownMenuItem data-testid="preview-dropdown-duplicate"><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" data-testid="preview-dropdown-delete"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  {
    name: "Table",
    description: "Data table for displaying structured information.",
    category: "display",
    code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
    preview: (
      <Table data-testid="preview-table">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow data-testid="preview-table-row-1">
            <TableCell>John Doe</TableCell>
            <TableCell><Badge variant="secondary" data-testid="preview-table-badge-active">Active</Badge></TableCell>
            <TableCell className="text-right">$250.00</TableCell>
          </TableRow>
          <TableRow data-testid="preview-table-row-2">
            <TableCell>Jane Smith</TableCell>
            <TableCell><Badge variant="outline" data-testid="preview-table-badge-pending">Pending</Badge></TableCell>
            <TableCell className="text-right">$150.00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ),
  },
  {
    name: "Accordion",
    description: "Expandable content sections.",
    category: "display",
    code: `<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>Content for section 1</AccordionContent>
  </AccordionItem>
</Accordion>`,
    preview: (
      <Accordion type="single" collapsible className="w-full max-w-md" data-testid="preview-accordion">
        <AccordionItem value="item-1">
          <AccordionTrigger data-testid="preview-accordion-trigger-1">Is it accessible?</AccordionTrigger>
          <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger data-testid="preview-accordion-trigger-2">Is it styled?</AccordionTrigger>
          <AccordionContent>Yes. It comes with default styles that match your theme.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger data-testid="preview-accordion-trigger-3">Is it animated?</AccordionTrigger>
          <AccordionContent>Yes. It has smooth animations by default.</AccordionContent>
        </AccordionItem>
      </Accordion>
    ),
  },
  {
    name: "ScrollArea",
    description: "Custom scrollable container with styled scrollbar.",
    category: "layout",
    code: `<ScrollArea className="h-48 w-48">
  <div>Long content here...</div>
</ScrollArea>`,
    preview: (
      <ScrollArea className="h-32 w-64 rounded-md border p-4" aria-label="Scrollable content" data-testid="preview-scrollarea">
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <p key={i} className="text-sm" data-testid={`preview-scrollarea-item-${i}`}>Scrollable item {i + 1}</p>
          ))}
        </div>
      </ScrollArea>
    ),
  },
  {
    name: "Separator",
    description: "Visual divider between content sections.",
    category: "layout",
    code: `<Separator />
<Separator orientation="vertical" className="h-4" />`,
    preview: (
      <div className="space-y-4">
        <div data-testid="preview-separator-above">Content above</div>
        <Separator data-testid="preview-separator-horizontal" />
        <div data-testid="preview-separator-below">Content below</div>
        <div className="flex items-center gap-4">
          <span>Left</span>
          <Separator orientation="vertical" className="h-4" data-testid="preview-separator-vertical" />
          <span>Right</span>
        </div>
      </div>
    ),
  },
  {
    name: "Alert",
    description: "Displays a callout for important information. Use for notifications and messages.",
    category: "feedback",
    variants: ["default", "destructive"],
    code: `<Alert>
  <Terminal className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>You can add components.</AlertDescription>
</Alert>`,
    preview: (
      <div className="flex flex-col gap-4 w-full max-w-md">
        <Alert data-testid="preview-alert-default">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
        </Alert>
        <Alert variant="destructive" data-testid="preview-alert-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
        </Alert>
      </div>
    ),
  },
  {
    name: "Breadcrumb",
    description: "Navigation trail showing the current page location.",
    category: "navigation",
    code: `<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Current</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`,
    preview: (
      <Breadcrumb data-testid="preview-breadcrumb">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#" data-testid="preview-breadcrumb-home">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#" data-testid="preview-breadcrumb-components">Components</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage data-testid="preview-breadcrumb-current">Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    ),
  },
  {
    name: "Collapsible",
    description: "Expandable/collapsible content section with trigger.",
    category: "display",
    code: `<Collapsible>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>Content</CollapsibleContent>
</Collapsible>`,
    preview: (
      <Collapsible className="w-full max-w-sm" data-testid="preview-collapsible">
        <div className="flex items-center justify-between px-4 py-2 border rounded-md">
          <span className="text-sm font-medium">@peduarte starred 3 repositories</span>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" data-testid="preview-collapsible-trigger">
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2 mt-2">
          <div className="px-4 py-2 border rounded-md text-sm" data-testid="preview-collapsible-item-1">@radix-ui/primitives</div>
          <div className="px-4 py-2 border rounded-md text-sm" data-testid="preview-collapsible-item-2">@radix-ui/colors</div>
        </CollapsibleContent>
      </Collapsible>
    ),
  },
  {
    name: "RadioGroup",
    description: "Single selection from a list of options.",
    category: "inputs",
    code: `<RadioGroup defaultValue="option1">
  <div className="flex items-center gap-2">
    <RadioGroupItem value="option1" id="r1" />
    <Label htmlFor="r1">Option 1</Label>
  </div>
</RadioGroup>`,
    preview: (
      <RadioGroup defaultValue="comfortable" data-testid="preview-radiogroup">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="default" id="r1" data-testid="preview-radio-default" />
          <Label htmlFor="r1">Default</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="comfortable" id="r2" data-testid="preview-radio-comfortable" />
          <Label htmlFor="r2">Comfortable</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="compact" id="r3" data-testid="preview-radio-compact" />
          <Label htmlFor="r3">Compact</Label>
        </div>
      </RadioGroup>
    ),
  },
  {
    name: "Sheet",
    description: "Slide-out panel from screen edge. Great for mobile menus and forms.",
    category: "overlay",
    code: `<Sheet>
  <SheetTrigger asChild>
    <Button>Open Sheet</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Sheet Title</SheetTitle>
      <SheetDescription>Description</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>`,
    preview: (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" data-testid="preview-sheet-trigger">Open Sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit Profile</SheetTitle>
            <SheetDescription>Make changes to your profile here.</SheetDescription>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" data-testid="preview-sheet-input" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    ),
  },
  {
    name: "Skeleton",
    description: "Loading placeholder that mimics content shape.",
    category: "feedback",
    code: `<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-12 w-12 rounded-full" />`,
    preview: (
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" data-testid="preview-skeleton-avatar" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" data-testid="preview-skeleton-line1" />
          <Skeleton className="h-4 w-[150px]" data-testid="preview-skeleton-line2" />
        </div>
      </div>
    ),
  },
  {
    name: "Toggle",
    description: "Two-state button that can be on or off.",
    category: "inputs",
    variants: ["default", "outline"],
    code: `<Toggle aria-label="Toggle bold">
  <Bold className="h-4 w-4" />
</Toggle>`,
    preview: (
      <div className="flex items-center gap-2">
        <Toggle aria-label="Toggle bold" data-testid="preview-toggle-bold">
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle aria-label="Toggle italic" data-testid="preview-toggle-italic">
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle aria-label="Toggle underline" variant="outline" data-testid="preview-toggle-underline">
          <Underline className="h-4 w-4" />
        </Toggle>
      </div>
    ),
  },
  {
    name: "ToggleGroup",
    description: "Group of toggles where one or multiple can be active.",
    category: "inputs",
    code: `<ToggleGroup type="single">
  <ToggleGroupItem value="bold">
    <Bold className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>`,
    preview: (
      <div className="flex flex-col gap-4">
        <ToggleGroup type="single" defaultValue="center" data-testid="preview-togglegroup-single">
          <ToggleGroupItem value="left" aria-label="Left align" data-testid="preview-togglegroup-left">
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Center align" data-testid="preview-togglegroup-center">
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Right align" data-testid="preview-togglegroup-right">
            <Underline className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="multiple" data-testid="preview-togglegroup-multiple">
          <ToggleGroupItem value="bold" aria-label="Toggle bold" data-testid="preview-togglegroup-bold">
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Toggle italic" data-testid="preview-togglegroup-italic">
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    ),
  },
  {
    name: "HoverCard",
    description: "Card that appears on hover for additional information.",
    category: "overlay",
    code: `<HoverCard>
  <HoverCardTrigger>Hover me</HoverCardTrigger>
  <HoverCardContent>Content</HoverCardContent>
</HoverCard>`,
    preview: (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="ghost" className="text-primary underline-offset-4 hover:underline p-0 h-auto" data-testid="preview-hovercard-trigger">@nextjs</Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80" data-testid="preview-hovercard-content">
          <div className="flex justify-between space-x-4">
            <Avatar data-testid="preview-hovercard-avatar">
              <AvatarImage src="" />
              <AvatarFallback>NJ</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">@nextjs</h4>
              <p className="text-sm text-muted-foreground">
                The React Framework – created and maintained by Vercel.
              </p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    ),
  },
];

const categories = [
  { id: "all", label: "All Components" },
  { id: "inputs", label: "Inputs" },
  { id: "display", label: "Display" },
  { id: "feedback", label: "Feedback" },
  { id: "navigation", label: "Navigation" },
  { id: "layout", label: "Layout" },
  { id: "overlay", label: "Overlay" },
] as const;

export default function EMComponentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredComponents = componentExamples.filter((component) => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyCode = (code: string, name: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(name);
    toast({ title: "Code copied", description: `${name} code copied to clipboard` });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <ScrollArea className="h-full" aria-label="Component library content">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Layers className="h-6 w-6" />
              Component Library
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse and copy reusable shadcn/ui components with usage examples
            </p>
          </div>
          <Badge variant="secondary">{componentExamples.length} Components</Badge>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-components"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48" data-testid="select-category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="grid gap-6">
          {filteredComponents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No components found</h3>
                <p className="text-muted-foreground text-sm">Try adjusting your search or filter</p>
              </CardContent>
            </Card>
          ) : (
            filteredComponents.map((component) => (
              <Card key={component.name} data-testid={`card-component-${component.name.toLowerCase()}`}>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{component.name}</CardTitle>
                      <Badge variant="outline" className="capitalize">{component.category}</Badge>
                      {component.variants && (
                        <span className="text-xs text-muted-foreground">
                          {component.variants.length} variants
                        </span>
                      )}
                    </div>
                    <CardDescription>{component.description}</CardDescription>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyCode(component.code, component.name)}
                    data-testid={`button-copy-${component.name.toLowerCase()}`}
                    aria-label={`Copy ${component.name} code`}
                  >
                    {copiedCode === component.name ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="preview" className="w-full">
                    <TabsList aria-label={`${component.name} preview and code tabs`}>
                      <TabsTrigger value="preview" aria-label="Preview tab">Preview</TabsTrigger>
                      <TabsTrigger value="code" aria-label="Code tab">Code</TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview" className="mt-4 p-4 border rounded-md bg-background min-h-24">
                      {component.preview}
                    </TabsContent>
                    <TabsContent value="code" className="mt-4">
                      <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm">
                        <code>{component.code}</code>
                      </pre>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Design System Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
              <span>Never add custom hover/active states to Buttons or Badges - they're built-in</span>
            </div>
            <div className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
              <span>Use <code className="bg-muted px-1 rounded">hover-elevate</code> for interactive Card elements</span>
            </div>
            <div className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
              <span>Always provide <code className="bg-muted px-1 rounded">value</code> prop to SelectItem components</span>
            </div>
            <div className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
              <span>Use <code className="bg-muted px-1 rounded">size="icon"</code> for icon-only buttons - never set custom h/w</span>
            </div>
            <div className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 mt-0.5 text-primary" />
              <span>Add <code className="bg-muted px-1 rounded">aria-label</code> to icon buttons and interactive elements</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
