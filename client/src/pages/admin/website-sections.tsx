import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Trash2, GripVertical, Eye, EyeOff, Loader2, Edit } from "lucide-react";
import type { WebsiteSection } from "@shared/schema";

const PAGE_SLUGS = [
  { id: "home", label: "Homepage" },
  { id: "pricing", label: "Pricing" },
  { id: "features", label: "Features" },
  { id: "about", label: "About Us" },
  { id: "contact", label: "Contact" },
];

const SECTION_TYPES = [
  { id: "hero", label: "Hero Banner", description: "Large banner with title, subtitle, and CTA" },
  { id: "features", label: "Features Grid", description: "Grid of feature cards" },
  { id: "pricing", label: "Pricing Table", description: "Pricing plans comparison" },
  { id: "testimonials", label: "Testimonials", description: "Customer testimonials carousel" },
  { id: "cta", label: "Call to Action", description: "Prominent action section" },
  { id: "stats", label: "Statistics", description: "Key numbers and metrics" },
  { id: "faq", label: "FAQ", description: "Frequently asked questions" },
  { id: "content", label: "Rich Content", description: "Free-form content block" },
  { id: "partners", label: "Partners/Logos", description: "Logo showcase" },
  { id: "contact_form", label: "Contact Form", description: "Contact submission form" },
];

export default function WebsiteSectionsPage() {
  const { toast } = useToast();
  const [selectedPage, setSelectedPage] = useState("home");
  const [editingSection, setEditingSection] = useState<WebsiteSection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<WebsiteSection>>({});

  const { data: sections, isLoading } = useQuery<WebsiteSection[]>({
    queryKey: ["/api/website-sections", selectedPage],
    queryFn: async () => {
      const res = await fetch(`/api/website-sections?pageSlug=${selectedPage}`);
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<WebsiteSection>) => {
      const res = await apiRequest("POST", "/api/website-sections", {
        pageSlug: selectedPage,
        ...data,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-sections"] });
      toast({ title: "Section created" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create section", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WebsiteSection> }) => {
      const res = await apiRequest("PATCH", `/api/website-sections/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-sections"] });
      toast({ title: "Section updated" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update section", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/website-sections/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-sections"] });
      toast({ title: "Section deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete section", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({});
    setEditingSection(null);
  };

  const openEditDialog = (section: WebsiteSection) => {
    setEditingSection(section);
    setFormData({
      sectionType: section.sectionType,
      title: section.title || "",
      subtitle: section.subtitle || "",
      content: section.content,
      backgroundImage: section.backgroundImage || "",
      backgroundColor: section.backgroundColor || "",
      displayOrder: section.displayOrder || 0,
      isVisible: section.isVisible ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingSection) {
      updateMutation.mutate({ id: editingSection.id, data: formData });
    } else {
      if (!formData.sectionType) {
        toast({ title: "Please select a section type", variant: "destructive" });
        return;
      }
      createMutation.mutate(formData);
    }
  };

  const toggleVisibility = (section: WebsiteSection) => {
    updateMutation.mutate({
      id: section.id,
      data: { isVisible: !section.isVisible },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Website Sections</h1>
          <p className="text-muted-foreground">Manage content sections for each page of your website</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} data-testid="button-add-section">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingSection ? "Edit Section" : "Add New Section"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Section Type</Label>
                <Select
                  value={formData.sectionType || ""}
                  onValueChange={v => setFormData(prev => ({ ...prev, sectionType: v }))}
                  disabled={!!editingSection}
                >
                  <SelectTrigger data-testid="select-section-type">
                    <SelectValue placeholder="Select section type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title || ""}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Section title"
                    data-testid="input-section-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={formData.displayOrder || 0}
                    onChange={e => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                    data-testid="input-display-order"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input
                  value={formData.subtitle || ""}
                  onChange={e => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Section subtitle"
                  data-testid="input-section-subtitle"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Background Image URL</Label>
                  <Input
                    value={formData.backgroundImage || ""}
                    onChange={e => setFormData(prev => ({ ...prev, backgroundImage: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    data-testid="input-background-image"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.backgroundColor || "#ffffff"}
                      onChange={e => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-12 h-9 p-1"
                      data-testid="input-bg-color"
                    />
                    <Input
                      value={formData.backgroundColor || ""}
                      onChange={e => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Content (JSON)</Label>
                <Textarea
                  value={typeof formData.content === "object" ? JSON.stringify(formData.content, null, 2) : (formData.content as string || "")}
                  onChange={e => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setFormData(prev => ({ ...prev, content: parsed }));
                    } catch {
                      setFormData(prev => ({ ...prev, content: e.target.value as any }));
                    }
                  }}
                  placeholder='{"heading": "Welcome", "features": []}'
                  rows={6}
                  className="font-mono text-sm"
                  data-testid="input-content-json"
                />
                <p className="text-xs text-muted-foreground">
                  Enter section-specific content as JSON. Structure varies by section type.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Visible</Label>
                  <p className="text-sm text-muted-foreground">Show this section on the page</p>
                </div>
                <Switch
                  checked={formData.isVisible ?? true}
                  onCheckedChange={v => setFormData(prev => ({ ...prev, isVisible: v }))}
                  data-testid="switch-visible"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-section"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {editingSection ? "Update Section" : "Create Section"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        {PAGE_SLUGS.map(page => (
          <Button
            key={page.id}
            variant={selectedPage === page.id ? "default" : "outline"}
            onClick={() => setSelectedPage(page.id)}
            data-testid={`button-page-${page.id}`}
          >
            {page.label}
            {sections && selectedPage === page.id && (
              <Badge variant="secondary" className="ml-2">
                {sections.length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {sections?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No sections for this page yet.</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Section
              </Button>
            </CardContent>
          </Card>
        ) : (
          sections?.map((section, index) => {
            const sectionType = SECTION_TYPES.find(t => t.id === section.sectionType);
            return (
              <Card key={section.id} className={!section.isVisible ? "opacity-50" : ""}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="text-muted-foreground cursor-grab">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{sectionType?.label || section.sectionType}</Badge>
                        <span className="font-medium">{section.title || "Untitled"}</span>
                        {!section.isVisible && (
                          <Badge variant="secondary">Hidden</Badge>
                        )}
                      </div>
                      {section.subtitle && (
                        <p className="text-sm text-muted-foreground mt-1">{section.subtitle}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Order: {section.displayOrder}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleVisibility(section)}
                        data-testid={`button-toggle-visibility-${section.id}`}
                      >
                        {section.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEditDialog(section)}
                        data-testid={`button-edit-section-${section.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(section.id)}
                        data-testid={`button-delete-section-${section.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
