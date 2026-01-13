import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, BookOpen, FolderOpen, Eye, EyeOff } from "lucide-react";
import type { DocCategory, DocArticle } from "@shared/schema";

type CategoryFormData = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  displayOrder: number;
  isPublished: boolean;
};

type ArticleFormData = {
  categoryId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string;
  displayOrder: number;
  isPublished: boolean;
};

const defaultCategoryForm: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  icon: "",
  displayOrder: 0,
  isPublished: true,
};

const defaultArticleForm: ArticleFormData = {
  categoryId: "",
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  author: "",
  tags: "",
  displayOrder: 0,
  isPublished: false,
};

export default function DocumentationPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("articles");
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isArtOpen, setIsArtOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DocCategory | null>(null);
  const [editingArticle, setEditingArticle] = useState<DocArticle | null>(null);
  const [catForm, setCatForm] = useState<CategoryFormData>(defaultCategoryForm);
  const [artForm, setArtForm] = useState<ArticleFormData>(defaultArticleForm);

  const { data: categories, isLoading: catLoading } = useQuery<DocCategory[]>({
    queryKey: ["/api/docs/categories"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: articles, isLoading: artLoading } = useQuery<DocArticle[]>({
    queryKey: ["/api/docs/articles"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const createCatMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const res = await apiRequest("POST", "/api/docs/categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/docs/categories"] });
      toast({ title: "Category created successfully" });
      resetCatForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create category", description: error.message, variant: "destructive" });
    },
  });

  const updateCatMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryFormData> }) => {
      const res = await apiRequest("PATCH", `/api/docs/categories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/docs/categories"] });
      toast({ title: "Category updated successfully" });
      resetCatForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update category", description: error.message, variant: "destructive" });
    },
  });

  const deleteCatMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/docs/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/docs/categories"] });
      toast({ title: "Category deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete category", description: error.message, variant: "destructive" });
    },
  });

  const createArtMutation = useMutation({
    mutationFn: async (data: ArticleFormData) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : null,
      };
      const res = await apiRequest("POST", "/api/docs/articles", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/docs/articles"] });
      toast({ title: "Article created successfully" });
      resetArtForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create article", description: error.message, variant: "destructive" });
    },
  });

  const updateArtMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ArticleFormData> }) => {
      const payload: Record<string, unknown> = { ...data };
      if (data.tags !== undefined) {
        payload.tags = data.tags ? data.tags.split(",").map((t) => t.trim()) : null;
      }
      const res = await apiRequest("PATCH", `/api/docs/articles/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/docs/articles"] });
      toast({ title: "Article updated successfully" });
      resetArtForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update article", description: error.message, variant: "destructive" });
    },
  });

  const deleteArtMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/docs/articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/docs/articles"] });
      toast({ title: "Article deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete article", description: error.message, variant: "destructive" });
    },
  });

  const resetCatForm = () => {
    setCatForm(defaultCategoryForm);
    setEditingCategory(null);
    setIsCatOpen(false);
  };

  const resetArtForm = () => {
    setArtForm(defaultArticleForm);
    setEditingArticle(null);
    setIsArtOpen(false);
  };

  const handleEditCategory = (cat: DocCategory) => {
    setEditingCategory(cat);
    setCatForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      icon: cat.icon || "",
      displayOrder: cat.displayOrder ?? 0,
      isPublished: cat.isPublished ?? true,
    });
    setIsCatOpen(true);
  };

  const handleEditArticle = (art: DocArticle) => {
    setEditingArticle(art);
    setArtForm({
      categoryId: art.categoryId,
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt || "",
      content: art.content || "",
      author: art.author || "",
      tags: art.tags?.join(", ") || "",
      displayOrder: art.displayOrder ?? 0,
      isPublished: art.isPublished ?? false,
    });
    setIsArtOpen(true);
  };

  const handleCatSubmit = () => {
    if (!catForm.name || !catForm.slug) {
      toast({ title: "Name and slug are required", variant: "destructive" });
      return;
    }
    if (editingCategory) {
      updateCatMutation.mutate({ id: editingCategory.id, data: catForm });
    } else {
      createCatMutation.mutate(catForm);
    }
  };

  const handleArtSubmit = () => {
    if (!artForm.categoryId || !artForm.title || !artForm.slug) {
      toast({ title: "Category, title and slug are required", variant: "destructive" });
      return;
    }
    if (editingArticle) {
      updateArtMutation.mutate({ id: editingArticle.id, data: artForm });
    } else {
      createArtMutation.mutate(artForm);
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCatMutation.mutate(id);
    }
  };

  const handleDeleteArticle = (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      deleteArtMutation.mutate(id);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories?.find((c) => c.id === categoryId)?.name || "Unknown";
  };

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  if (catLoading || artLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading documentation...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Documentation</h1>
          <p className="text-muted-foreground">Manage knowledge base categories and articles</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="articles" data-testid="tab-articles">
            <BookOpen className="w-4 h-4 mr-2" />
            Articles ({articles?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="categories" data-testid="tab-categories">
            <FolderOpen className="w-4 h-4 mr-2" />
            Categories ({categories?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Articles</CardTitle>
              <Dialog open={isArtOpen} onOpenChange={setIsArtOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-article" onClick={() => resetArtForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Article
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingArticle ? "Edit Article" : "Add Article"}</DialogTitle>
                    <DialogDescription>Create or edit documentation articles</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="art-category">Category</Label>
                        <Select
                          value={artForm.categoryId}
                          onValueChange={(value) => setArtForm({ ...artForm, categoryId: value })}
                        >
                          <SelectTrigger data-testid="select-article-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="art-author">Author</Label>
                        <Input
                          id="art-author"
                          data-testid="input-article-author"
                          value={artForm.author}
                          onChange={(e) => setArtForm({ ...artForm, author: e.target.value })}
                          placeholder="Author name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="art-title">Title</Label>
                      <Input
                        id="art-title"
                        data-testid="input-article-title"
                        value={artForm.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          setArtForm({
                            ...artForm,
                            title,
                            slug: artForm.slug || slugify(title),
                          });
                        }}
                        placeholder="Article title"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="art-slug">Slug</Label>
                        <Input
                          id="art-slug"
                          data-testid="input-article-slug"
                          value={artForm.slug}
                          onChange={(e) => setArtForm({ ...artForm, slug: e.target.value })}
                          placeholder="article-slug"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="art-order">Display Order</Label>
                        <Input
                          id="art-order"
                          type="number"
                          data-testid="input-article-order"
                          value={artForm.displayOrder}
                          onChange={(e) => setArtForm({ ...artForm, displayOrder: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="art-excerpt">Excerpt</Label>
                      <Textarea
                        id="art-excerpt"
                        data-testid="input-article-excerpt"
                        value={artForm.excerpt}
                        onChange={(e) => setArtForm({ ...artForm, excerpt: e.target.value })}
                        placeholder="Brief summary of the article"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="art-content">Content (Markdown)</Label>
                      <Textarea
                        id="art-content"
                        data-testid="input-article-content"
                        value={artForm.content}
                        onChange={(e) => setArtForm({ ...artForm, content: e.target.value })}
                        placeholder="Article content in Markdown format..."
                        rows={10}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="art-tags">Tags (comma-separated)</Label>
                      <Input
                        id="art-tags"
                        data-testid="input-article-tags"
                        value={artForm.tags}
                        onChange={(e) => setArtForm({ ...artForm, tags: e.target.value })}
                        placeholder="getting-started, api, tutorial"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id="art-published"
                        data-testid="switch-article-published"
                        checked={artForm.isPublished}
                        onCheckedChange={(checked) => setArtForm({ ...artForm, isPublished: checked })}
                      />
                      <Label htmlFor="art-published">Published</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetArtForm}>
                      Cancel
                    </Button>
                    <Button
                      data-testid="button-save-article"
                      onClick={handleArtSubmit}
                      disabled={createArtMutation.isPending || updateArtMutation.isPending}
                    >
                      {createArtMutation.isPending || updateArtMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {!articles?.length ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No articles yet. Create your first article.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((art) => (
                      <TableRow key={art.id} data-testid={`row-article-${art.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{art.title}</div>
                            <div className="text-sm text-muted-foreground">/{art.slug}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryName(art.categoryId)}</TableCell>
                        <TableCell>{art.author || "-"}</TableCell>
                        <TableCell>
                          {art.isPublished ? (
                            <Badge variant="default" className="gap-1">
                              <Eye className="w-3 h-3" /> Published
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <EyeOff className="w-3 h-3" /> Draft
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              data-testid={`button-edit-article-${art.id}`}
                              onClick={() => handleEditArticle(art)}
                              aria-label="Edit"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              data-testid={`button-delete-article-${art.id}`}
                              onClick={() => handleDeleteArticle(art.id)}
                              disabled={deleteArtMutation.isPending}
                              aria-label="Delete"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Categories</CardTitle>
              <Dialog open={isCatOpen} onOpenChange={setIsCatOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-category" onClick={() => resetCatForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
                    <DialogDescription>Organize your documentation into categories</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-name">Name</Label>
                      <Input
                        id="cat-name"
                        data-testid="input-category-name"
                        value={catForm.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setCatForm({
                            ...catForm,
                            name,
                            slug: catForm.slug || slugify(name),
                          });
                        }}
                        placeholder="Getting Started"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cat-slug">Slug</Label>
                        <Input
                          id="cat-slug"
                          data-testid="input-category-slug"
                          value={catForm.slug}
                          onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                          placeholder="getting-started"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cat-icon">Icon</Label>
                        <Input
                          id="cat-icon"
                          data-testid="input-category-icon"
                          value={catForm.icon}
                          onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                          placeholder="book"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cat-desc">Description</Label>
                      <Textarea
                        id="cat-desc"
                        data-testid="input-category-description"
                        value={catForm.description}
                        onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                        placeholder="Category description"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cat-order">Display Order</Label>
                        <Input
                          id="cat-order"
                          type="number"
                          data-testid="input-category-order"
                          value={catForm.displayOrder}
                          onChange={(e) => setCatForm({ ...catForm, displayOrder: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <Switch
                          id="cat-published"
                          data-testid="switch-category-published"
                          checked={catForm.isPublished}
                          onCheckedChange={(checked) => setCatForm({ ...catForm, isPublished: checked })}
                        />
                        <Label htmlFor="cat-published">Published</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={resetCatForm}>
                      Cancel
                    </Button>
                    <Button
                      data-testid="button-save-category"
                      onClick={handleCatSubmit}
                      disabled={createCatMutation.isPending || updateCatMutation.isPending}
                    >
                      {createCatMutation.isPending || updateCatMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {!categories?.length ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No categories yet. Create your first category.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Articles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((cat) => {
                      const articleCount = articles?.filter((a) => a.categoryId === cat.id).length || 0;
                      return (
                        <TableRow key={cat.id} data-testid={`row-category-${cat.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FolderOpen className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{cat.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">/{cat.slug}</TableCell>
                          <TableCell>{articleCount}</TableCell>
                          <TableCell>
                            {cat.isPublished ? (
                              <Badge variant="default" className="gap-1">
                                <Eye className="w-3 h-3" /> Published
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <EyeOff className="w-3 h-3" /> Draft
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                data-testid={`button-edit-category-${cat.id}`}
                                onClick={() => handleEditCategory(cat)}
                                aria-label="Edit"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                data-testid={`button-delete-category-${cat.id}`}
                                onClick={() => handleDeleteCategory(cat.id)}
                                disabled={deleteCatMutation.isPending}
                                aria-label="Delete"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
