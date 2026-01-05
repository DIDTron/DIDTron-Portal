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
import { Plus, Palette, Pencil, Trash2, Check } from "lucide-react";
import type { CmsTheme } from "@shared/schema";

type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
};

type ThemeTypography = {
  fontFamily: string;
  headingFont: string;
};

type ThemeFormData = {
  name: string;
  description: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  borderRadius: string;
  isDefault: boolean;
};

const defaultColors: ThemeColors = {
  primary: "#2563EB",
  secondary: "#64748B",
  background: "#FFFFFF",
  text: "#0F172A",
  accent: "#3B82F6",
};

const defaultTypography: ThemeTypography = {
  fontFamily: "Inter",
  headingFont: "Inter",
};

const defaultFormData: ThemeFormData = {
  name: "",
  description: "",
  colors: defaultColors,
  typography: defaultTypography,
  borderRadius: "md",
  isDefault: false,
};

export default function CmsThemesPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<CmsTheme | null>(null);
  const [formData, setFormData] = useState<ThemeFormData>(defaultFormData);

  const { data: themes, isLoading } = useQuery<CmsTheme[]>({
    queryKey: ["/api/cms/themes"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: ThemeFormData) => {
      const res = await apiRequest("POST", "/api/cms/themes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/themes"] });
      toast({ title: "Theme created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create theme", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ThemeFormData> }) => {
      const res = await apiRequest("PATCH", `/api/cms/themes/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/themes"] });
      toast({ title: "Theme updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update theme", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cms/themes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/themes"] });
      toast({ title: "Theme deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete theme", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingTheme(null);
    setIsOpen(false);
  };

  const getThemeColors = (theme: CmsTheme): ThemeColors => {
    const colors = theme.colors as ThemeColors | null;
    return colors || defaultColors;
  };

  const getThemeTypography = (theme: CmsTheme): ThemeTypography => {
    const typography = theme.typography as ThemeTypography | null;
    return typography || defaultTypography;
  };

  const handleEdit = (theme: CmsTheme) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      description: theme.description || "",
      colors: getThemeColors(theme),
      typography: getThemeTypography(theme),
      borderRadius: theme.borderRadius || "md",
      isDefault: theme.isDefault ?? false,
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast({ title: "Theme name is required", variant: "destructive" });
      return;
    }
    if (editingTheme) {
      updateMutation.mutate({ id: editingTheme.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this theme?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleDefault = (theme: CmsTheme) => {
    updateMutation.mutate({ id: theme.id, data: { isDefault: !theme.isDefault } });
  };

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setFormData({
      ...formData,
      colors: { ...formData.colors, [key]: value },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading themes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">CMS Themes</h1>
          <p className="text-muted-foreground">Manage color themes for your white-label portals</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-theme" onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Theme
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTheme ? "Edit Theme" : "Create Theme"}</DialogTitle>
              <DialogDescription>
                Configure colors and typography for your theme
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="name">Theme Name</Label>
                <Input
                  id="name"
                  data-testid="input-theme-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Corporate Blue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  data-testid="input-theme-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A brief description of this theme"
                />
              </div>

              <div className="space-y-3">
                <Label>Colors</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Primary</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        data-testid="input-primary-color"
                        type="color"
                        value={formData.colors.primary}
                        onChange={(e) => updateColor("primary", e.target.value)}
                        className="w-10 h-9 p-1"
                      />
                      <Input
                        value={formData.colors.primary}
                        onChange={(e) => updateColor("primary", e.target.value)}
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Secondary</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        data-testid="input-secondary-color"
                        type="color"
                        value={formData.colors.secondary}
                        onChange={(e) => updateColor("secondary", e.target.value)}
                        className="w-10 h-9 p-1"
                      />
                      <Input
                        value={formData.colors.secondary}
                        onChange={(e) => updateColor("secondary", e.target.value)}
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Background</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        data-testid="input-bg-color"
                        type="color"
                        value={formData.colors.background}
                        onChange={(e) => updateColor("background", e.target.value)}
                        className="w-10 h-9 p-1"
                      />
                      <Input
                        value={formData.colors.background}
                        onChange={(e) => updateColor("background", e.target.value)}
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Text</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        data-testid="input-text-color"
                        type="color"
                        value={formData.colors.text}
                        onChange={(e) => updateColor("text", e.target.value)}
                        className="w-10 h-9 p-1"
                      />
                      <Input
                        value={formData.colors.text}
                        onChange={(e) => updateColor("text", e.target.value)}
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <Label className="text-xs text-muted-foreground">Accent</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        data-testid="input-accent-color"
                        type="color"
                        value={formData.colors.accent}
                        onChange={(e) => updateColor("accent", e.target.value)}
                        className="w-10 h-9 p-1"
                      />
                      <Input
                        value={formData.colors.accent}
                        onChange={(e) => updateColor("accent", e.target.value)}
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Input
                  id="fontFamily"
                  data-testid="input-font-family"
                  value={formData.typography.fontFamily}
                  onChange={(e) => setFormData({
                    ...formData,
                    typography: { ...formData.typography, fontFamily: e.target.value }
                  })}
                  placeholder="e.g., Inter, Roboto, Open Sans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="borderRadius">Border Radius</Label>
                <Input
                  id="borderRadius"
                  data-testid="input-border-radius"
                  value={formData.borderRadius}
                  onChange={(e) => setFormData({ ...formData, borderRadius: e.target.value })}
                  placeholder="sm, md, lg, xl, full"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isDefault">Set as Default Theme</Label>
                <Switch
                  id="isDefault"
                  data-testid="switch-is-default"
                  checked={formData.isDefault}
                  onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
                />
              </div>

              <div className="rounded-md border p-4">
                <Label className="text-sm text-muted-foreground mb-2 block">Preview</Label>
                <div
                  className="rounded-md p-4"
                  style={{
                    backgroundColor: formData.colors.background,
                    color: formData.colors.text,
                    fontFamily: formData.typography.fontFamily,
                  }}
                >
                  <h3 style={{ color: formData.colors.primary }} className="font-semibold mb-2">
                    {formData.name || "Theme Preview"}
                  </h3>
                  <p className="text-sm mb-2">This is how your theme will look.</p>
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className="px-3 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: formData.colors.primary }}
                    >
                      Primary
                    </span>
                    <span
                      className="px-3 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: formData.colors.secondary }}
                    >
                      Secondary
                    </span>
                    <span
                      className="px-3 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: formData.colors.accent }}
                    >
                      Accent
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                data-testid="button-save-theme"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Theme"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!themes?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Palette className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-1">No themes yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first theme to customize portal appearance
            </p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Theme
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Theme</TableHead>
                <TableHead>Colors</TableHead>
                <TableHead>Font</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {themes.map((theme) => {
                const colors = getThemeColors(theme);
                const typography = getThemeTypography(theme);
                return (
                  <TableRow key={theme.id} data-testid={`row-theme-${theme.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-md border flex items-center justify-center"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Palette className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{theme.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {theme.description || "No description"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: colors.primary }}
                          title="Primary"
                        />
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: colors.secondary }}
                          title="Secondary"
                        />
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: colors.background }}
                          title="Background"
                        />
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: colors.text }}
                          title="Text"
                        />
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: colors.accent }}
                          title="Accent"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{typography.fontFamily}</span>
                    </TableCell>
                    <TableCell>
                      {theme.isDefault ? (
                        <Badge variant="default" className="gap-1">
                          <Check className="w-3 h-3" />
                          Default
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Custom</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-edit-theme-${theme.id}`}
                          onClick={() => handleEdit(theme)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-toggle-theme-${theme.id}`}
                          onClick={() => handleToggleDefault(theme)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-delete-theme-${theme.id}`}
                          onClick={() => handleDelete(theme.id)}
                          disabled={deleteMutation.isPending}
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
        </Card>
      )}
    </div>
  );
}
