import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Image, FileText, Folder, Trash2, Pencil, Copy, ExternalLink } from "lucide-react";
import type { CmsMediaItem } from "@shared/schema";

type MediaFormData = {
  name: string;
  type: string;
  url: string;
  thumbnailUrl: string;
  altText: string;
  folder: string;
  tags: string;
};

const defaultFormData: MediaFormData = {
  name: "",
  type: "image",
  url: "",
  thumbnailUrl: "",
  altText: "",
  folder: "",
  tags: "",
};

const MEDIA_TYPES = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "audio", label: "Audio" },
  { value: "document", label: "Document" },
  { value: "other", label: "Other" },
];

export default function MediaLibraryPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CmsMediaItem | null>(null);
  const [formData, setFormData] = useState<MediaFormData>(defaultFormData);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterFolder, setFilterFolder] = useState<string>("all");

  const { data: items, isLoading } = useQuery<CmsMediaItem[]>({
    queryKey: ["/api/cms/media"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: MediaFormData) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : null,
      };
      const res = await apiRequest("POST", "/api/cms/media", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/media"] });
      toast({ title: "Media item added successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add media item", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MediaFormData> }) => {
      const payload: Record<string, unknown> = { ...data };
      if (data.tags !== undefined) {
        payload.tags = data.tags ? data.tags.split(",").map((t) => t.trim()) : null;
      }
      const res = await apiRequest("PATCH", `/api/cms/media/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/media"] });
      toast({ title: "Media item updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update media item", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cms/media/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cms/media"] });
      toast({ title: "Media item deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete media item", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingItem(null);
    setIsOpen(false);
  };

  const handleEdit = (item: CmsMediaItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl || "",
      altText: item.altText || "",
      folder: item.folder || "",
      tags: item.tags?.join(", ") || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (!formData.url) {
      toast({ title: "URL is required", variant: "destructive" });
      return;
    }
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this media item?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "URL copied to clipboard" });
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "image":
        return Image;
      case "document":
        return FileText;
      default:
        return FileText;
    }
  };

  const folders = items
    ? Array.from(new Set(items.filter((i) => i.folder).map((i) => i.folder!)))
    : [];

  const filteredItems = items?.filter((item) => {
    if (filterType !== "all" && item.type !== filterType) return false;
    if (filterFolder !== "all" && item.folder !== filterFolder) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading media library...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Media Library</h1>
          <p className="text-muted-foreground">Manage images, documents, and other media assets</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32" data-testid="select-filter-type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {MEDIA_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {folders.length > 0 && (
            <Select value={filterFolder} onValueChange={setFilterFolder}>
              <SelectTrigger className="w-32" data-testid="select-filter-folder">
                <SelectValue placeholder="Folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Folders</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-media" onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Media
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Media" : "Add Media"}</DialogTitle>
                <DialogDescription>
                  Add or edit a media item in your library
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      data-testid="input-media-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Logo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger data-testid="select-media-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDIA_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    data-testid="input-media-url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com/image.png"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
                  <Input
                    id="thumbnailUrl"
                    data-testid="input-media-thumbnail"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    placeholder="https://example.com/thumb.png"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="altText">Alt Text (optional)</Label>
                  <Input
                    id="altText"
                    data-testid="input-media-alt"
                    value={formData.altText}
                    onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                    placeholder="Description for accessibility"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="folder">Folder (optional)</Label>
                    <Input
                      id="folder"
                      data-testid="input-media-folder"
                      value={formData.folder}
                      onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                      placeholder="e.g., logos"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      data-testid="input-media-tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="logo, brand, header"
                    />
                  </div>
                </div>

                {formData.url && formData.type === "image" && (
                  <div className="rounded-md border p-4">
                    <Label className="text-sm text-muted-foreground mb-2 block">Preview</Label>
                    <img
                      src={formData.url}
                      alt={formData.altText || "Preview"}
                      className="max-h-40 rounded-md object-contain mx-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  data-testid="button-save-media"
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!filteredItems?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-1">No media items yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first media item to build your library
            </p>
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Media
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => {
            const Icon = getMediaIcon(item.type);
            return (
              <Card key={item.id} data-testid={`card-media-${item.id}`} className="overflow-hidden">
                <div className="aspect-square bg-muted relative flex items-center justify-center">
                  {item.type === "image" ? (
                    <img
                      src={item.thumbnailUrl || item.url}
                      alt={item.altText || item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="flex items-center justify-center w-full h-full"><svg class="w-12 h-12 text-muted-foreground" viewBox="0 0 24 24"><path fill="currentColor" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg></div>`;
                      }}
                    />
                  ) : (
                    <Icon className="w-12 h-12 text-muted-foreground" />
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm truncate">{item.name}</h4>
                      {item.folder && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Folder className="w-3 h-3" />
                          {item.folder}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        data-testid={`button-copy-url-${item.id}`}
                        onClick={() => handleCopyUrl(item.url)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        data-testid={`button-open-${item.id}`}
                        onClick={() => window.open(item.url, "_blank")}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        data-testid={`button-edit-media-${item.id}`}
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        data-testid={`button-delete-media-${item.id}`}
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
