import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  FileText, 
  Pencil, 
  Trash2, 
  Eye, 
  EyeOff,
  Globe,
  Image,
  BookOpen,
  Upload,
  Save,
  ExternalLink,
  GripVertical,
  Copy,
  MoreHorizontal,
  Search,
  Filter,
  Layout,
  Type,
  ImageIcon,
  Star,
  MessageSquare,
  DollarSign,
  HelpCircle,
  Users,
  Mail,
  AlertCircle
} from "lucide-react";
import type { EmContentItem } from "@shared/schema";

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "preview";
  lastModified: string;
  sections: number;
}

const SECTION_TYPES = [
  { id: "hero", label: "Hero Banner", icon: Layout, description: "Large banner with title, subtitle, and CTA" },
  { id: "features", label: "Features Grid", icon: Star, description: "Grid of feature cards" },
  { id: "pricing", label: "Pricing Table", icon: DollarSign, description: "Pricing plans comparison" },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare, description: "Customer testimonials" },
  { id: "cta", label: "Call to Action", icon: Type, description: "Prominent action section" },
  { id: "stats", label: "Statistics", icon: Users, description: "Key numbers and metrics" },
  { id: "faq", label: "FAQ", icon: HelpCircle, description: "Frequently asked questions" },
  { id: "content", label: "Rich Content", icon: FileText, description: "Free-form content block" },
  { id: "partners", label: "Partners/Logos", icon: ImageIcon, description: "Logo showcase" },
  { id: "contact", label: "Contact Form", icon: Mail, description: "Contact submission form" },
];

export default function EMMarketingPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pages");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: contentItems = [], isLoading } = useQuery<EmContentItem[]>({
    queryKey: ["/api/em/content-items"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const marketingItems = contentItems.filter(item => item.section === "marketing");
  
  const formatTimeAgo = (date: Date | string | null | undefined) => {
    if (!date) return "Never";
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const pages: LandingPage[] = marketingItems
    .filter(item => item.entityType === "landing_page")
    .map(item => ({
      id: item.id,
      title: item.name || item.slug,
      slug: `/${item.slug}`,
      status: item.status as "draft" | "published" | "preview",
      lastModified: formatTimeAgo(item.updatedAt),
      sections: 0,
    }));

  const blogPosts = marketingItems.filter(item => item.entityType === "blog_post");
  const docs = marketingItems.filter(item => item.entityType === "documentation");

  const filteredPages = useMemo(() => {
    return pages.filter(page =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pages, searchQuery]);

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(filteredPages);

  const handleAddSection = (type: string) => {
    toast({ title: `Adding ${type} section`, description: "Section added to page builder" });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Marketing Website</h1>
          <p className="text-sm text-muted-foreground">Manage landing pages, blog posts, and documentation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              window.open("/", "_blank");
              toast({ title: "Opening preview", description: "Marketing site opened in new tab" });
            }}
            data-testid="button-preview"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Site
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-page">
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-6">
          <TabsList className="h-auto p-0 bg-transparent">
            <TabsTrigger value="pages" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary" data-testid="tab-pages">
              <FileText className="h-4 w-4 mr-2" />
              Landing Pages
            </TabsTrigger>
            <TabsTrigger value="blog" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary" data-testid="tab-blog">
              <BookOpen className="h-4 w-4 mr-2" />
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="docs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary" data-testid="tab-docs">
              <BookOpen className="h-4 w-4 mr-2" />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="media" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary" data-testid="tab-media">
              <Image className="h-4 w-4 mr-2" />
              Media Library
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pages" className="flex-1 mt-0 overflow-auto">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-pages"
                />
              </div>
              <Button variant="outline" size="sm" data-testid="button-filter">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            <Card>
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : pages.length === 0 ? (
                <div className="p-12 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Landing Pages Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first landing page to get started with the marketing website.
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Page
                  </Button>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Sections</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Modified</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedItems.map((page) => (
                        <TableRow key={page.id} data-testid={`row-page-${page.id}`}>
                          <TableCell className="font-medium">{page.title}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">{page.slug}</code>
                          </TableCell>
                          <TableCell>{page.sections} sections</TableCell>
                          <TableCell>
                            {page.status === "published" ? (
                              <Badge variant="default">Published</Badge>
                            ) : (
                              <Badge variant="secondary">Draft</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{page.lastModified}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button size="icon" variant="ghost" data-testid={`button-edit-${page.id}`} aria-label="Edit" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" data-testid={`button-preview-${page.id}`} aria-label="Preview" title="Preview">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" data-testid={`button-delete-${page.id}`} aria-label="Delete" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <DataTableFooter
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                  />
                </>
              )}
            </Card>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Section Templates</h3>
              <p className="text-sm text-muted-foreground mb-4">Drag these section types into your page builder</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {SECTION_TYPES.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Card 
                      key={section.id} 
                      className="hover-elevate cursor-pointer p-4"
                      onClick={() => handleAddSection(section.id)}
                      data-testid={`section-template-${section.id}`}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className="p-2 rounded-md bg-muted">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">{section.label}</span>
                        <span className="text-xs text-muted-foreground">{section.description}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="blog" className="flex-1 mt-0 overflow-auto">
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Blog Posts</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create and manage blog posts for your marketing website
              </p>
              <Button data-testid="button-create-post">
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="docs" className="flex-1 mt-0 overflow-auto">
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Documentation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your API documentation and help articles
              </p>
              <Button data-testid="button-manage-docs">
                <Plus className="h-4 w-4 mr-2" />
                Add Documentation
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="media" className="flex-1 mt-0 overflow-auto">
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Image className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Media Library</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload and manage images, videos, and documents
              </p>
              <Button data-testid="button-upload-media">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>Add a new landing page to your marketing website</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input id="title" placeholder="e.g., Product Features" data-testid="input-page-title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input id="slug" placeholder="e.g., /features" data-testid="input-page-slug" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Meta Description</Label>
              <Textarea id="description" placeholder="Brief description for SEO" data-testid="input-page-description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button data-testid="button-create-page">Create Page</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
