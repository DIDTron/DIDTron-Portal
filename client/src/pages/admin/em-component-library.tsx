import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator, ContextMenuCheckboxItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuLabel } from "@/components/ui/context-menu";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSub, MenubarSubContent, MenubarSubTrigger } from "@/components/ui/menubar";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Search, Copy, Check, Plus, Trash2, Edit, MoreHorizontal, 
  ChevronRight, Settings, User, Bell, LogOut, Layers, Terminal,
  AlertCircle, ChevronDown, Bold, Italic, Underline, Home, ChevronsUpDown,
  Calculator, Calendar as CalendarIcon, CreditCard, Smile, Mail, MessageSquare,
  PlusCircle, UserPlus, Cloud, Github, Keyboard, LifeBuoy, Settings2,
  ChevronLeft, Menu, PanelLeft, Image, Inbox, FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface ComponentExample {
  name: string;
  description: string;
  category: "inputs" | "display" | "feedback" | "navigation" | "layout" | "overlay" | "data" | "custom";
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
  {
    name: "AspectRatio",
    description: "Maintains consistent width-to-height ratio for images and media.",
    category: "layout",
    code: `<AspectRatio ratio={16 / 9}>
  <img src="..." alt="..." className="object-cover" />
</AspectRatio>`,
    preview: (
      <div className="w-64">
        <AspectRatio ratio={16 / 9} data-testid="preview-aspectratio">
          <div className="flex items-center justify-center w-full h-full bg-muted rounded-md">
            <Image className="h-8 w-8 text-muted-foreground" />
          </div>
        </AspectRatio>
      </div>
    ),
  },
  {
    name: "Calendar",
    description: "Date picker calendar component. Use with Popover for date selection.",
    category: "inputs",
    code: `<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
/>`,
    preview: (
      <Calendar
        mode="single"
        className="rounded-md border"
        data-testid="preview-calendar"
      />
    ),
  },
  {
    name: "Command",
    description: "Command palette for search and actions. Great for keyboard navigation.",
    category: "inputs",
    code: `<Command>
  <CommandInput placeholder="Search..." />
  <CommandList>
    <CommandEmpty>No results</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`,
    preview: (
      <Command className="rounded-lg border shadow-md max-w-sm" data-testid="preview-command">
        <CommandInput placeholder="Type a command..." data-testid="preview-command-input" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem data-testid="preview-command-calendar"><CalendarIcon className="mr-2 h-4 w-4" /> Calendar</CommandItem>
            <CommandItem data-testid="preview-command-search"><Search className="mr-2 h-4 w-4" /> Search</CommandItem>
            <CommandItem data-testid="preview-command-settings"><Settings className="mr-2 h-4 w-4" /> Settings</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem data-testid="preview-command-profile"><User className="mr-2 h-4 w-4" /> Profile</CommandItem>
            <CommandItem data-testid="preview-command-mail"><Mail className="mr-2 h-4 w-4" /> Mail</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    ),
  },
  {
    name: "ContextMenu",
    description: "Right-click menu for contextual actions.",
    category: "navigation",
    code: `<ContextMenu>
  <ContextMenuTrigger>Right click here</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Edit</ContextMenuItem>
    <ContextMenuItem>Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
    preview: (
      <ContextMenu>
        <ContextMenuTrigger className="flex h-32 w-64 items-center justify-center rounded-md border border-dashed text-sm" data-testid="preview-contextmenu-trigger">
          Right click here
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem data-testid="preview-contextmenu-back"><ChevronLeft className="mr-2 h-4 w-4" /> Back</ContextMenuItem>
          <ContextMenuItem data-testid="preview-contextmenu-forward" disabled>Forward</ContextMenuItem>
          <ContextMenuItem data-testid="preview-contextmenu-reload"><ChevronRight className="mr-2 h-4 w-4" /> Reload</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuCheckboxItem checked data-testid="preview-contextmenu-checkbox">Show Bookmarks</ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem data-testid="preview-contextmenu-checkbox2">Show Full URLs</ContextMenuCheckboxItem>
          <ContextMenuSeparator />
          <ContextMenuRadioGroup value="pedro">
            <ContextMenuLabel>People</ContextMenuLabel>
            <ContextMenuRadioItem value="pedro" data-testid="preview-contextmenu-radio1">Pedro</ContextMenuRadioItem>
            <ContextMenuRadioItem value="colm" data-testid="preview-contextmenu-radio2">Colm</ContextMenuRadioItem>
          </ContextMenuRadioGroup>
        </ContextMenuContent>
      </ContextMenu>
    ),
  },
  {
    name: "Drawer",
    description: "Mobile-friendly bottom sheet. Slides up from bottom of screen.",
    category: "overlay",
    code: `<Drawer>
  <DrawerTrigger asChild>
    <Button>Open Drawer</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Title</DrawerTitle>
    </DrawerHeader>
  </DrawerContent>
</Drawer>`,
    preview: (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" data-testid="preview-drawer-trigger">Open Drawer</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Move Goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <div className="flex items-center justify-center space-x-2">
              <Button variant="outline" size="icon" data-testid="preview-drawer-minus">-</Button>
              <div className="text-center">
                <div className="text-5xl font-bold">350</div>
                <div className="text-muted-foreground text-sm">Calories/day</div>
              </div>
              <Button variant="outline" size="icon" data-testid="preview-drawer-plus">+</Button>
            </div>
          </div>
          <DrawerFooter>
            <Button data-testid="preview-drawer-submit">Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline" data-testid="preview-drawer-cancel">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    ),
  },
  {
    name: "Menubar",
    description: "Desktop application-style menu bar with dropdowns.",
    category: "navigation",
    code: `<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New Tab</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`,
    preview: (
      <Menubar data-testid="preview-menubar">
        <MenubarMenu>
          <MenubarTrigger data-testid="preview-menubar-file">File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem data-testid="preview-menubar-newtab">New Tab</MenubarItem>
            <MenubarItem data-testid="preview-menubar-newwindow">New Window</MenubarItem>
            <MenubarSeparator />
            <MenubarItem data-testid="preview-menubar-share">Share</MenubarItem>
            <MenubarSeparator />
            <MenubarItem data-testid="preview-menubar-print">Print</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger data-testid="preview-menubar-edit">Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem data-testid="preview-menubar-undo">Undo</MenubarItem>
            <MenubarItem data-testid="preview-menubar-redo">Redo</MenubarItem>
            <MenubarSeparator />
            <MenubarItem data-testid="preview-menubar-cut">Cut</MenubarItem>
            <MenubarItem data-testid="preview-menubar-copy">Copy</MenubarItem>
            <MenubarItem data-testid="preview-menubar-paste">Paste</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger data-testid="preview-menubar-view">View</MenubarTrigger>
          <MenubarContent>
            <MenubarCheckboxItem data-testid="preview-menubar-toolbar" checked>Toolbar</MenubarCheckboxItem>
            <MenubarCheckboxItem data-testid="preview-menubar-sidebar">Sidebar</MenubarCheckboxItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    ),
  },
  {
    name: "NavigationMenu",
    description: "Website navigation with mega-menu support.",
    category: "navigation",
    code: `<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Item</NavigationMenuTrigger>
      <NavigationMenuContent>Content</NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`,
    preview: (
      <NavigationMenu data-testid="preview-navmenu">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger data-testid="preview-navmenu-getting-started">Getting started</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid gap-3 p-4 w-64">
                <NavigationMenuLink asChild>
                  <a href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" data-testid="preview-navmenu-intro">
                    <div className="text-sm font-medium leading-none">Introduction</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Get started with the platform</p>
                  </a>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger data-testid="preview-navmenu-components">Components</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid gap-3 p-4 w-64">
                <NavigationMenuLink asChild>
                  <a href="#" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent" data-testid="preview-navmenu-alert">
                    <div className="text-sm font-medium leading-none">Alert</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">Displays important messages</p>
                  </a>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    ),
  },
  {
    name: "Pagination",
    description: "Page navigation for lists and tables.",
    category: "navigation",
    code: `<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>`,
    preview: (
      <Pagination data-testid="preview-pagination">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" data-testid="preview-pagination-prev" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" data-testid="preview-pagination-1">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive data-testid="preview-pagination-2">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" data-testid="preview-pagination-3">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis data-testid="preview-pagination-ellipsis" />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" data-testid="preview-pagination-next" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    ),
  },
  {
    name: "Resizable",
    description: "Resizable panel groups for flexible layouts.",
    category: "layout",
    code: `<ResizablePanelGroup direction="horizontal">
  <ResizablePanel>Left</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel>Right</ResizablePanel>
</ResizablePanelGroup>`,
    preview: (
      <ResizablePanelGroup direction="horizontal" className="min-h-[150px] max-w-md rounded-lg border" data-testid="preview-resizable">
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-4" data-testid="preview-resizable-left">
            <span className="font-semibold">Left Panel</span>
          </div>
        </ResizablePanel>
        <ResizableHandle data-testid="preview-resizable-handle" />
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center p-4" data-testid="preview-resizable-right">
            <span className="font-semibold">Right Panel</span>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    ),
  },
  {
    name: "DataTableFooter",
    description: "CUSTOM: Standard pagination footer for all data tables in the platform.",
    category: "data",
    code: `const { currentPage, pageSize, totalPages, totalItems, paginatedItems, onPageChange, onPageSizeChange } = useDataTablePagination(data, 10);

<DataTableFooter
  currentPage={currentPage}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={totalItems}
  onPageChange={onPageChange}
  onPageSizeChange={onPageSizeChange}
/>`,
    preview: (
      <div className="border rounded-md p-4 max-w-lg" data-testid="preview-datatablefooter">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Rows per page:</span>
            <Select defaultValue="10">
              <SelectTrigger className="h-8 w-16" data-testid="preview-datatable-pagesize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-muted-foreground" data-testid="preview-datatable-info">Showing 1-10 of 100</div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" data-testid="preview-datatable-prev"><ChevronLeft className="h-4 w-4" /></Button>
            <Input className="h-8 w-12 text-center" defaultValue="1" data-testid="preview-datatable-page" />
            <Button variant="outline" size="icon" className="h-8 w-8" data-testid="preview-datatable-next"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    ),
  },
  {
    name: "CardFooter",
    description: "Footer section for Card component with action buttons.",
    category: "layout",
    code: `<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>`,
    preview: (
      <Card className="max-w-sm" data-testid="preview-cardfooter">
        <CardHeader>
          <CardTitle data-testid="preview-cardfooter-title">Create Project</CardTitle>
          <CardDescription>Deploy your new project in one-click.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="project-name">Name</Label>
            <Input id="project-name" placeholder="My Project" data-testid="preview-cardfooter-input" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Button variant="outline" data-testid="preview-cardfooter-cancel">Cancel</Button>
          <Button data-testid="preview-cardfooter-deploy">Deploy</Button>
        </CardFooter>
      </Card>
    ),
  },
  {
    name: "ScrollBar",
    description: "Custom scrollbar styling for ScrollArea component.",
    category: "layout",
    code: `<ScrollArea className="w-48 whitespace-nowrap">
  <div className="flex w-max space-x-4 p-4">
    {items.map((item) => <div key={item}>{item}</div>)}
  </div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>`,
    preview: (
      <ScrollArea className="w-64 whitespace-nowrap rounded-md border" data-testid="preview-scrollbar">
        <div className="flex w-max space-x-4 p-4">
          {["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6", "Item 7"].map((item, i) => (
            <div key={item} className="w-24 shrink-0 rounded-md border p-3 text-center" data-testid={`preview-scrollbar-item-${i}`}>
              {item}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    ),
  },
  {
    name: "DropdownMenuAdvanced",
    description: "Advanced dropdown with checkboxes, radio items, and submenus.",
    category: "navigation",
    code: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Open</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuCheckboxItem>Show Panel</DropdownMenuCheckboxItem>
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>Nested</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  </DropdownMenuContent>
</DropdownMenu>`,
    preview: (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" data-testid="preview-dropdown-adv-trigger">Open Advanced Menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked data-testid="preview-dropdown-adv-check1">Status Bar</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem data-testid="preview-dropdown-adv-check2">Activity Bar</DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value="pedro">
            <DropdownMenuLabel>Team</DropdownMenuLabel>
            <DropdownMenuRadioItem value="pedro" data-testid="preview-dropdown-adv-radio1">Pedro</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="colm" data-testid="preview-dropdown-adv-radio2">Colm</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger data-testid="preview-dropdown-adv-sub">Invite users</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem data-testid="preview-dropdown-adv-email"><Mail className="mr-2 h-4 w-4" /> Email</DropdownMenuItem>
              <DropdownMenuItem data-testid="preview-dropdown-adv-message"><MessageSquare className="mr-2 h-4 w-4" /> Message</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  {
    name: "Carousel",
    description: "Scrollable content carousel with navigation controls.",
    category: "display",
    code: `<Carousel>
  <CarouselContent>
    <CarouselItem>Slide 1</CarouselItem>
    <CarouselItem>Slide 2</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`,
    preview: (
      <Carousel className="w-full max-w-xs mx-auto" data-testid="preview-carousel">
        <CarouselContent>
          {[1, 2, 3, 4, 5].map((num) => (
            <CarouselItem key={num}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6" data-testid={`preview-carousel-item-${num}`}>
                    <span className="text-4xl font-semibold">{num}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious data-testid="preview-carousel-prev" />
        <CarouselNext data-testid="preview-carousel-next" />
      </Carousel>
    ),
  },
  {
    name: "InputOTP",
    description: "One-time password input with configurable slots.",
    category: "inputs",
    code: `<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>`,
    preview: (
      <InputOTP maxLength={6} data-testid="preview-inputotp">
        <InputOTPGroup>
          <InputOTPSlot index={0} data-testid="preview-inputotp-slot-0" />
          <InputOTPSlot index={1} data-testid="preview-inputotp-slot-1" />
          <InputOTPSlot index={2} data-testid="preview-inputotp-slot-2" />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} data-testid="preview-inputotp-slot-3" />
          <InputOTPSlot index={4} data-testid="preview-inputotp-slot-4" />
          <InputOTPSlot index={5} data-testid="preview-inputotp-slot-5" />
        </InputOTPGroup>
      </InputOTP>
    ),
  },
  {
    name: "Toast",
    description: "Brief notification that appears temporarily. Triggered via useToast hook.",
    category: "feedback",
    code: `import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

// Show toast
toast({
  title: "Success",
  description: "Your action completed",
});

// Destructive variant
toast({
  variant: "destructive",
  title: "Error",
  description: "Something went wrong",
});`,
    preview: (
      <div className="flex flex-col gap-2" data-testid="preview-toast">
        <Button 
          variant="outline" 
          data-testid="preview-toast-default"
          onClick={() => {}}
        >
          Show Default Toast
        </Button>
        <Button 
          variant="destructive" 
          data-testid="preview-toast-destructive"
          onClick={() => {}}
        >
          Show Error Toast
        </Button>
        <p className="text-sm text-muted-foreground">Note: Use useToast() hook to trigger toasts</p>
      </div>
    ),
  },
  {
    name: "Toaster",
    description: "Container component that renders toast notifications. Mount once at app root.",
    category: "feedback",
    code: `// In App.tsx or main layout
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <YourAppContent />
      <Toaster />
    </>
  );
}`,
    preview: (
      <div className="border rounded-lg p-4 max-w-sm" data-testid="preview-toaster">
        <p className="text-sm font-medium mb-2">Toaster Setup:</p>
        <div className="space-y-2 text-sm">
          <div className="bg-muted p-2 rounded text-xs font-mono" data-testid="preview-toaster-code">
            {"<Toaster />"}
          </div>
          <p className="text-muted-foreground text-xs">
            Mount this component once at the root of your application.
            It will render all toast notifications triggered by useToast().
          </p>
        </div>
        <div className="mt-3 border-t pt-3">
          <p className="text-xs font-medium">Toast positions:</p>
          <div className="grid grid-cols-3 gap-1 mt-1 text-xs text-muted-foreground">
            <span data-testid="preview-toaster-pos-1">top-left</span>
            <span data-testid="preview-toaster-pos-2">top-center</span>
            <span data-testid="preview-toaster-pos-3">top-right</span>
            <span data-testid="preview-toaster-pos-4">bottom-left</span>
            <span data-testid="preview-toaster-pos-5">bottom-center</span>
            <span data-testid="preview-toaster-pos-6">bottom-right</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    name: "SidebarComponent",
    description: "CUSTOM: Application sidebar with icon rail and expandable menu. Use SidebarProvider at app root.",
    category: "custom",
    code: `<SidebarProvider>
  <Sidebar>
    <SidebarHeader>
      <h2>App Name</h2>
    </SidebarHeader>
    <SidebarContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <a href="/dashboard">Dashboard</a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarContent>
  </Sidebar>
  <SidebarTrigger />
  <main>Content</main>
</SidebarProvider>`,
    preview: (
      <div className="border rounded-lg p-4 max-w-sm" data-testid="preview-sidebar">
        <p className="text-sm font-medium mb-2">Sidebar Structure:</p>
        <div className="flex gap-2 text-sm">
          <div className="bg-sidebar border rounded p-2 w-12" data-testid="preview-sidebar-icon-rail">
            <div className="space-y-2">
              <Home className="h-4 w-4 mx-auto" />
              <Settings className="h-4 w-4 mx-auto" />
              <User className="h-4 w-4 mx-auto" />
            </div>
          </div>
          <div className="bg-sidebar border rounded p-2 flex-1" data-testid="preview-sidebar-menu">
            <p className="font-medium text-xs mb-1">Menu</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Dashboard</p>
              <p>Settings</p>
              <p>Profile</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">See App.tsx for full implementation</p>
      </div>
    ),
  },
  {
    name: "Form",
    description: "Form wrapper using react-hook-form with Zod validation. Use with FormField components.",
    category: "inputs",
    code: `import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: "" }
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>`,
    preview: (
      <div className="space-y-4 max-w-sm" data-testid="preview-form">
        <div className="space-y-2">
          <Label htmlFor="form-name" data-testid="preview-form-label">Username</Label>
          <Input id="form-name" placeholder="Enter username" data-testid="preview-form-input" />
          <p className="text-xs text-muted-foreground">This is your public display name.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="form-email" data-testid="preview-form-email-label">Email</Label>
          <Input id="form-email" type="email" placeholder="email@example.com" data-testid="preview-form-email-input" />
        </div>
        <Button className="w-full" data-testid="preview-form-submit">Submit</Button>
      </div>
    ),
  },
  {
    name: "Chart",
    description: "Data visualization using Recharts. Import from @/components/ui/chart.",
    category: "data",
    code: `import { ChartContainer, ChartTooltip, ChartLegend } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis } from "recharts";

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" }
};

<ChartContainer config={chartConfig}>
  <BarChart data={data}>
    <XAxis dataKey="month" />
    <YAxis />
    <Bar dataKey="revenue" fill="var(--color-revenue)" />
    <ChartTooltip />
  </BarChart>
</ChartContainer>`,
    preview: (
      <div className="border rounded-lg p-4" data-testid="preview-chart">
        <div className="flex items-end gap-2 h-24">
          <div className="bg-primary w-8 h-16 rounded-t" data-testid="preview-chart-bar-1" />
          <div className="bg-primary w-8 h-20 rounded-t" data-testid="preview-chart-bar-2" />
          <div className="bg-primary w-8 h-12 rounded-t" data-testid="preview-chart-bar-3" />
          <div className="bg-primary w-8 h-24 rounded-t" data-testid="preview-chart-bar-4" />
          <div className="bg-primary w-8 h-18 rounded-t" data-testid="preview-chart-bar-5" />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Uses Recharts with shadcn chart wrapper</p>
      </div>
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
  { id: "data", label: "Data & Tables" },
  { id: "custom", label: "Custom/Platform" },
] as const;

const customComponents = [
  { name: "DataTableFooter", path: "@/components/ui/data-table-footer", description: "Pagination footer for all data tables. REQUIRED for Super Admin tables.", category: "data" },
  { name: "FloatingParticles", path: "@/components/ui/floating-particles", description: "Canvas-based particle effect with cursor tracking. Used on login page.", category: "effects" },
  { name: "ThemeToggle", path: "@/components/theme-toggle", description: "Light/Dark/System mode toggle button.", category: "utility" },
  { name: "ThemeProvider", path: "@/components/theme-provider", description: "Wraps app to provide theme context.", category: "utility" },
  { name: "ActionDock", path: "@/components/layout/super-admin/action-dock", description: "Fixed bottom-right dock with Save/Delete/Cancel/Reset buttons.", category: "layout" },
  { name: "ConfigWorkspace", path: "@/components/layout/super-admin/config-workspace", description: "Tab container for General/Advanced/Assignment config sections.", category: "layout" },
  { name: "GlobalHeader", path: "@/components/layout/super-admin/global-header", description: "Main header with logo, search, notifications, user menu.", category: "layout" },
  { name: "PrimarySidebar", path: "@/components/layout/super-admin/primary-sidebar", description: "Left icon sidebar with drag-and-drop reordering.", category: "navigation" },
  { name: "SecondarySidebar", path: "@/components/layout/super-admin/secondary-sidebar", description: "Secondary nav sidebar with drag-and-drop reordering.", category: "navigation" },
  { name: "WorkspaceTabs", path: "@/components/layout/super-admin/workspace-tabs", description: "Browser-like tabs with context menu (close, close others, close all).", category: "navigation" },
  { name: "CommandPalette", path: "@/components/layout/customer-portal/command-palette", description: "Cmd+K search palette for quick navigation.", category: "navigation" },
  { name: "SearchResults", path: "@/components/layout/super-admin/search-results", description: "Search results overlay panel.", category: "navigation" },
  { name: "Sidebar", path: "@/components/ui/sidebar", description: "Full sidebar system with collapsible, mobile, and variants.", category: "layout" },
];

const behavioralPatterns = [
  {
    id: "refresh-button",
    name: "Refresh Button Pattern",
    badge: "Critical",
    badgeVariant: "destructive" as const,
    description: "Use refetch() directly and isFetching for spinner. Never use isLoading for refresh buttons.",
    code: `// 1. Get refetch and isFetching from useQuery
const { data, isFetching, refetch } = useQuery<DataType>({
  queryKey: ["/api/endpoint"],
});

// 2. Refresh button uses refetch() directly
<Button
  variant="outline"
  size="icon"
  onClick={() => refetch()}
  disabled={isFetching}
  data-testid="button-refresh"
>
  <RefreshCw className={\`h-4 w-4 \${isFetching ? "animate-spin" : ""}\`} />
</Button>`,
    note: "Use isFetching (not isLoading) - isLoading is only true on first load, isFetching is true during any fetch."
  },
  {
    id: "auto-refresh",
    name: "Auto-Refresh Pattern",
    badge: "Critical",
    badgeVariant: "destructive" as const,
    description: "Spinner only when fetching - NEVER based on autoRefresh toggle alone.",
    code: `const [autoRefresh, setAutoRefresh] = useState(false);

const { data, isFetching, refetch } = useQuery<DataType>({
  queryKey: ["/api/endpoint"],
  refetchInterval: autoRefresh ? 30000 : false, // 30s when enabled
});

// Spinner ONLY when actually fetching
<Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
  <RefreshCw className={\`h-4 w-4 \${isFetching ? "animate-spin" : ""}\`} />
</Button>

// Toggle switch
<Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
<Label>Auto-refresh (30s)</Label>`,
  },
  {
    id: "multiple-queries",
    name: "Multiple Queries Pattern",
    badge: "Common",
    badgeVariant: "secondary" as const,
    description: "Combine isFetching states for pages with multiple data sources.",
    code: `// Track isFetching from all queries
const { data: users, isFetching: usersFetching, refetch: refetchUsers } = useQuery({
  queryKey: ["/api/users"],
});
const { data: orders, isFetching: ordersFetching, refetch: refetchOrders } = useQuery({
  queryKey: ["/api/orders"],
});

// Combine all fetching states
const isAnyFetching = usersFetching || ordersFetching;

// Sync All button
const handleSyncAll = async () => {
  await Promise.all([refetchUsers(), refetchOrders()]);
};

<Button onClick={handleSyncAll} disabled={isAnyFetching}>
  <RefreshCw className={\`h-4 w-4 mr-2 \${isAnyFetching ? "animate-spin" : ""}\`} />
  Sync All
</Button>`,
  },
  {
    id: "mutation",
    name: "Mutation with Cache Invalidation",
    badge: "Common",
    badgeVariant: "secondary" as const,
    description: "Create/Update/Delete with automatic cache refresh.",
    code: `import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

const createMutation = useMutation({
  mutationFn: (data: CreateType) => apiRequest("POST", "/api/items", data),
  onSuccess: () => {
    // Invalidate to refetch fresh data
    queryClient.invalidateQueries({ queryKey: ["/api/items"] });
    toast({ title: "Item created successfully" });
  },
  onError: (error: Error) => {
    toast({ title: "Failed to create", description: error.message, variant: "destructive" });
  },
});

// Use in form/button
<Button onClick={() => createMutation.mutate(formData)} disabled={createMutation.isPending}>
  {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
  Create
</Button>`,
  },
  {
    id: "form",
    name: "Form with Validation",
    badge: "Common",
    badgeVariant: "secondary" as const,
    description: "React Hook Form with Zod validation and shadcn Form components.",
    code: `import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertItemSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const form = useForm<z.infer<typeof insertItemSchema>>({
  resolver: zodResolver(insertItemSchema),
  defaultValues: { name: "", email: "" },
});

const onSubmit = (data: z.infer<typeof insertItemSchema>) => {
  createMutation.mutate(data);
};

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
    <Button type="submit" disabled={createMutation.isPending}>
      {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      Submit
    </Button>
  </form>
</Form>`,
  },
  {
    id: "loading-states",
    name: "Loading States",
    badge: "UX",
    badgeVariant: "outline" as const,
    description: "Proper loading indicators for queries and mutations.",
    code: `// Query loading - show skeleton on first load
const { data, isLoading, isFetching } = useQuery({ queryKey: ["/api/items"] });

if (isLoading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

// Full-page spinner for initial load
if (isLoading) {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

// Inline spinner for background refetch
{isFetching && <Loader2 className="h-4 w-4 animate-spin" />}

// Button spinner for mutations
<Button disabled={mutation.isPending}>
  {mutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
  Save
</Button>`,
  },
  {
    id: "drag-drop",
    name: "Drag & Drop Reorder",
    badge: "Advanced",
    badgeVariant: "outline" as const,
    description: "Reorderable lists using @dnd-kit. Used in sidebars for custom ordering.",
    code: `import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable item component
function SortableItem({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

// Parent component
function ReorderableList({ items, onReorder }) {
  const sensors = useSensors(useSensor(PointerSensor));
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };
  
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        {items.map(item => <SortableItem key={item.id} id={item.id}>{item.name}</SortableItem>)}
      </SortableContext>
    </DndContext>
  );
}`,
  },
  {
    id: "toast-notifications",
    name: "Toast Notifications",
    badge: "Common",
    badgeVariant: "secondary" as const,
    description: "Show feedback messages using useToast hook.",
    code: `import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

// Success toast
toast({ title: "Success", description: "Item created successfully" });

// Error toast
toast({ 
  title: "Error", 
  description: "Something went wrong", 
  variant: "destructive" 
});

// With action button
toast({
  title: "Item deleted",
  description: "The item has been removed",
  action: <Button variant="outline" size="sm" onClick={handleUndo}>Undo</Button>,
});`,
  },
  {
    id: "zustand-store",
    name: "Zustand State Management",
    badge: "Advanced",
    badgeVariant: "outline" as const,
    description: "Global state management with Zustand. Used for tabs, branding, portal state.",
    code: `import { create } from "zustand";

interface TabsStore {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  addTab: (tab: WorkspaceTab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
}

export const useTabsStore = create<TabsStore>((set) => ({
  tabs: [],
  activeTabId: null,
  addTab: (tab) => set((state) => ({ 
    tabs: [...state.tabs, tab], 
    activeTabId: tab.id 
  })),
  closeTab: (id) => set((state) => ({
    tabs: state.tabs.filter(t => t.id !== id),
    activeTabId: state.tabs[0]?.id || null
  })),
  setActiveTab: (id) => set({ activeTabId: id }),
}));

// Usage in component
const { tabs, activeTabId, addTab } = useTabsStore();`,
  },
  {
    id: "dialog-form",
    name: "Dialog with Form",
    badge: "Common",
    badgeVariant: "secondary" as const,
    description: "Modal dialog with form for create/edit operations.",
    code: `const [open, setOpen] = useState(false);

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button data-testid="button-create"><Plus className="h-4 w-4 mr-2" />Create</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create New Item</DialogTitle>
      <DialogDescription>Fill in the details below.</DialogDescription>
    </DialogHeader>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="name" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input {...field} data-testid="input-name" /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </form>
    </Form>
  </DialogContent>
</Dialog>`,
  },
  {
    id: "data-table",
    name: "Data Table with Pagination",
    badge: "Critical",
    badgeVariant: "destructive" as const,
    description: "Standard table pattern with DataTableFooter. REQUIRED for all Super Admin tables.",
    code: `import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";

const { data, isFetching } = useQuery<ItemType[]>({ queryKey: ["/api/items"] });

// Filter and paginate
const filteredData = data?.filter(item => 
  item.name.toLowerCase().includes(searchQuery.toLowerCase())
) || [];

const { paginatedData, ...paginationProps } = useDataTablePagination(filteredData);

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {paginatedData.map((item) => (
      <TableRow key={item.id} data-testid={\`row-item-\${item.id}\`}>
        <TableCell>{item.name}</TableCell>
        <TableCell><Badge>{item.status}</Badge></TableCell>
        <TableCell className="text-right">
          <Button size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
<DataTableFooter {...paginationProps} />`,
    note: "DataTableFooter is MANDATORY for all data tables in Super Admin portal."
  },
];

const designRules = [
  { rule: "Never add custom hover/active states to Buttons or Badges - they're built-in", category: "interaction" },
  { rule: "Use hover-elevate for interactive Card elements", category: "interaction" },
  { rule: "Always provide value prop to SelectItem components", category: "component" },
  { rule: "Use size=\"icon\" for icon-only buttons - never set custom h/w", category: "component" },
  { rule: "Add aria-label to icon buttons and interactive elements", category: "accessibility" },
  { rule: "Use isFetching for refresh spinners, isLoading only for first load", category: "data" },
  { rule: "Always use refetch() for manual refresh buttons, not just invalidateQueries", category: "data" },
  { rule: "Add data-testid to all interactive elements and key display content", category: "testing" },
  { rule: "Use DataTableFooter for ALL data tables in Super Admin portal", category: "component" },
  { rule: "Follow VitalPBX-style layout with double sidebars", category: "layout" },
];

export default function EMComponentLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("components");
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

  const getCategoryCount = (categoryId: string) => {
    if (categoryId === "all") return componentExamples.length;
    return componentExamples.filter(c => c.category === categoryId).length;
  };

  return (
    <ScrollArea className="h-full" aria-label="Component library content">
      <div className="p-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Layers className="h-6 w-6" />
              Component Library
            </h1>
          </div>
          <p className="text-muted-foreground">
            Visual components, behavioral patterns, and design rules for the DIDTron platform.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{componentExamples.length} Components</Badge>
            <Badge variant="outline">{behavioralPatterns.length} Patterns</Badge>
            <Badge variant="outline">{customComponents.length} Custom</Badge>
            <Badge variant="outline">{designRules.length} Rules</Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg" data-testid="tabs-library-main">
            <TabsTrigger value="components" data-testid="tab-components">
              <Layers className="h-4 w-4 mr-2" />
              Components
            </TabsTrigger>
            <TabsTrigger value="patterns" data-testid="tab-patterns">
              <Terminal className="h-4 w-4 mr-2" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="rules" data-testid="tab-rules">
              <AlertCircle className="h-4 w-4 mr-2" />
              Rules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="mt-6 space-y-6">
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
                <SelectTrigger className="w-56" data-testid="select-category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center justify-between w-full gap-4">
                        {cat.label}
                        <Badge variant="secondary" className="ml-auto text-xs">{getCategoryCount(cat.id)}</Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  data-testid={`button-category-${cat.id}`}
                >
                  {cat.label}
                  <Badge variant={selectedCategory === cat.id ? "secondary" : "outline"} className="ml-2 text-xs">
                    {getCategoryCount(cat.id)}
                  </Badge>
                </Button>
              ))}
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
          </TabsContent>

          <TabsContent value="patterns" className="mt-6 space-y-8">
            <p className="text-muted-foreground">
              Copy-paste patterns for data fetching, forms, state management, and mutations. Scroll down for custom platform components.
            </p>

            <div className="grid gap-4">
              {behavioralPatterns.map((pattern) => (
                <Card key={pattern.id} data-testid={`card-pattern-${pattern.id}`}>
                  <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-lg">{pattern.name}</CardTitle>
                        <Badge variant={pattern.badgeVariant}>{pattern.badge}</Badge>
                      </div>
                      <CardDescription>{pattern.description}</CardDescription>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => copyCode(pattern.code, pattern.name)}
                      data-testid={`button-copy-${pattern.id}`}
                      aria-label={`Copy ${pattern.name} code`}
                    >
                      {copiedCode === pattern.name ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm max-h-64 overflow-y-auto">
                      <code>{pattern.code}</code>
                    </pre>
                    {pattern.note && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Key Rule</AlertTitle>
                        <AlertDescription>{pattern.note}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            <h3 className="text-lg font-semibold">Custom Platform Components</h3>

            <div className="grid gap-3 md:grid-cols-2">
              {customComponents.map((comp) => (
                <Card key={comp.name} data-testid={`card-custom-${comp.name.toLowerCase()}`} className="hover-elevate">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base">{comp.name}</CardTitle>
                      <Badge variant="outline" className="capitalize text-xs">{comp.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">{comp.description}</p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto">
                        import {"{"} {comp.name} {"}"} from "{comp.path}"
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="shrink-0"
                        onClick={() => copyCode(`import { ${comp.name} } from "${comp.path}";`, comp.name)}
                        data-testid={`button-copy-custom-${comp.name.toLowerCase()}`}
                        aria-label={`Copy ${comp.name} import`}
                      >
                        {copiedCode === comp.name ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rules" className="mt-6 space-y-6">
            <p className="text-muted-foreground">
              Design system rules for consistency. Follow these guidelines when building new features.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Interaction Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {designRules.filter(r => r.category === "interaction").map((rule, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>{rule.rule}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Component Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {designRules.filter(r => r.category === "component").map((rule, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>{rule.rule}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Terminal className="h-4 w-4" />
                    Data Fetching Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {designRules.filter(r => r.category === "data").map((rule, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>{rule.rule}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Accessibility & Testing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {designRules.filter(r => r.category === "accessibility" || r.category === "testing").map((rule, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>{rule.rule}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Layout Rules
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {designRules.filter(r => r.category === "layout").map((rule, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <span>{rule.rule}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
