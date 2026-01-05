import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, FileText, Pencil, Trash2, Globe, EyeOff } from "lucide-react";
import type { CmsPage } from "@shared/schema";

type PageFormData = {
  portalId: string;
  slug: string;
  title: string;
  metaDescription: string;
  metaKeywords: string;
  content: string;
  isPublished: boolean;
};

const defaultFormData: PageFormData = {
  portalId: "default",
  slug: "",
  title: "",
  metaDescription: "",
  metaKeywords: "",
  content: "",
  isPublished: false,
};

export default function CmsPagesPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);
  const [formData, setFormData] = useState<PageFormData>(defaultFormData);

  const { data: pages, isLoading } = useQuery<CmsPage[]>({
    queryKey: ["/api/cms/pages"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: PageFormData) => {
      const res = await apiRequest("POST", "/api/cms/pages", {
        ...data,
        content: data.content ? { html: data.content } : null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      toast({ title: "Page created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create page", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PageFormData> }) => {
      const payload: Record<string, unknown> = { ...data };
      if (data.content !== undefined) {
        payload.content = data.content ? { html: data.content } : null;
      }
      const res = await apiRequest("PATCH", `/api/cms/pages/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      toast({ title: "Page updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update page", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cms/pages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/pages"] });
      toast({ title: "Page deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete page", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingPage(null);
    setIsOpen(false);
  };

  const getPageContent = (page: CmsPage): string => {
    if (!page.content) return "";
    const content = page.content as { html?: string };
    return content.html || "";
  };

  const handleEdit = (page: CmsPage) => {
    setEditingPage(page);
    setFormData({
      portalId: page.portalId,
      slug: page.slug,
      title: page.title,
      metaDescription: page.metaDescription || "",
      metaKeywords: page.metaKeywords || "",
      content: getPageContent(page),
      isPublished: page.isPublished ?? false,
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title) {
      toast({ title: "Page title is required", variant: "destructive" });
      return;
    }
    if (!formData.slug) {
      toast({ title: "Page slug is required", variant: "destructive" });
      return;
    }
    if (editingPage) {
      updateMutation.mutate({ id: editingPage.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this page?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleTogglePublish = (page: CmsPage) => {
    const newPublished = !page.isPublished;
    updateMutation.mutate({
      id: page.id,
      data: {
        isPublished: newPublished,
        ...(newPublished ? {} : {}),
      },
    });
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading pages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">CMS Pages</h1>
          <p className="text-muted-foreground">Create and manage website pages</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-page" onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPage ? "Edit Page" : "Create Page"}</DialogTitle>
              <DialogDescription>
                Add or edit page content and SEO settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    data-testid="input-page-title"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData({
                        ...formData,
                        title,
                        slug: formData.slug || generateSlug(title),
                      });
                    }}
                    placeholder="e.g., About Us"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    data-testid="input-page-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g., about-us"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  data-testid="input-meta-description"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="Brief description for search engines"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  data-testid="input-meta-keywords"
                  value={formData.metaKeywords}
                  onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Page Content (HTML)</Label>
                <Textarea
                  id="content"
                  data-testid="input-page-content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="<h1>Welcome</h1><p>Your content here...</p>"
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isPublished">Publish Page</Label>
                <Switch
                  id="isPublished"
                  data-testid="switch-is-published"
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                data-testid="button-save-page"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Page"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!pages?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-1">No pages yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first page to build your website content
            </p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((page) => (
                <TableRow key={page.id} data-testid={`row-page-${page.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{page.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {page.metaDescription
                            ? page.metaDescription.substring(0, 50) + (page.metaDescription.length > 50 ? "..." : "")
                            : "No description"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">/{page.slug}</code>
                  </TableCell>
                  <TableCell>
                    {page.isPublished ? (
                      <Badge variant="default" className="gap-1">
                        <Globe className="w-3 h-3" />
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <EyeOff className="w-3 h-3" />
                        Draft
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-edit-page-${page.id}`}
                        onClick={() => handleEdit(page)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-toggle-page-${page.id}`}
                        onClick={() => handleTogglePublish(page)}
                      >
                        {page.isPublished ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Globe className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        data-testid={`button-delete-page-${page.id}`}
                        onClick={() => handleDelete(page.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
