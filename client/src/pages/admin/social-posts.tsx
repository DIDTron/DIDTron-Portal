import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, FileText, Pencil, Trash2, Sparkles, Send, Clock } from "lucide-react";
import { SiX, SiFacebook, SiLinkedin, SiInstagram } from "react-icons/si";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import type { SocialPost } from "@shared/schema";

type PostFormData = {
  content: string;
  platforms: string[];
  status: string;
  scheduledAt: string;
};

const PLATFORMS = [
  { value: "twitter", label: "Twitter/X", icon: SiX },
  { value: "facebook", label: "Facebook", icon: SiFacebook },
  { value: "linkedin", label: "LinkedIn", icon: SiLinkedin },
  { value: "instagram", label: "Instagram", icon: SiInstagram },
];

const TONES = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "technical", label: "Technical" },
  { value: "casual", label: "Casual" },
];

export default function SocialPostsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [formData, setFormData] = useState<PostFormData>({
    content: "",
    platforms: ["twitter"],
    status: "draft",
    scheduledAt: "",
  });
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("professional");
  const [aiPlatforms, setAiPlatforms] = useState<string[]>(["twitter"]);

  const { data: posts, isLoading } = useQuery<SocialPost[]>({
    queryKey: ["/api/social-posts"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(posts ?? []);

  const createMutation = useMutation({
    mutationFn: async (data: PostFormData) => {
      const res = await apiRequest("POST", "/api/social-posts", {
        ...data,
        scheduledAt: data.scheduledAt || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-posts"] });
      toast({ title: "Post created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create post", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PostFormData }) => {
      const res = await apiRequest("PATCH", `/api/social-posts/${id}`, {
        ...data,
        scheduledAt: data.scheduledAt || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-posts"] });
      toast({ title: "Post updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update post", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/social-posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-posts"] });
      toast({ title: "Post deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete post", description: error.message, variant: "destructive" });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/social-posts/generate", {
        topic: aiTopic,
        tone: aiTone,
        platforms: aiPlatforms,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setFormData({
        ...formData,
        content: data.content,
        platforms: aiPlatforms,
      });
      setIsAiOpen(false);
      setIsOpen(true);
      toast({ title: "AI content generated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to generate content", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      content: "",
      platforms: ["twitter"],
      status: "draft",
      scheduledAt: "",
    });
    setEditingPost(null);
    setIsOpen(false);
  };

  const handleEdit = (post: SocialPost) => {
    setEditingPost(post);
    setFormData({
      content: post.content,
      platforms: post.platforms || ["twitter"],
      status: post.status || "draft",
      scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : "",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const toggleAiPlatform = (platform: string) => {
    setAiPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default">Published</Badge>;
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const getPlatformIcons = (platforms: string[] | null) => {
    if (!platforms?.length) return "-";
    return (
      <div className="flex items-center gap-1">
        {platforms.map((p) => {
          const platform = PLATFORMS.find((pl) => pl.value === p);
          if (!platform) return null;
          const Icon = platform.icon;
          return <Icon key={p} className="h-4 w-4" />;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4" data-testid="social-posts-page">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold" data-testid="text-page-title">Social Posts</h2>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAiOpen} onOpenChange={setIsAiOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" data-testid="button-ai-generate">
                <Sparkles className="h-4 w-4 mr-1" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" data-testid="dialog-ai-generate">
              <DialogHeader>
                <DialogTitle>Generate AI Content</DialogTitle>
                <DialogDescription>
                  Let AI help you create engaging social media content
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aiTopic">Topic</Label>
                  <Input
                    id="aiTopic"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g., New VoIP features, Industry news, Product update"
                    data-testid="input-ai-topic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aiTone">Tone</Label>
                  <Select value={aiTone} onValueChange={setAiTone}>
                    <SelectTrigger data-testid="select-ai-tone">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Platforms</Label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => (
                      <Button
                        key={p.value}
                        type="button"
                        size="sm"
                        variant={aiPlatforms.includes(p.value) ? "default" : "outline"}
                        onClick={() => toggleAiPlatform(p.value)}
                        className="toggle-elevate"
                        data-testid={`button-ai-platform-${p.value}`}
                      >
                        <p.icon className="h-4 w-4 mr-1" />
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAiOpen(false)}
                  data-testid="button-ai-cancel"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => generateMutation.mutate()}
                  disabled={!aiTopic || generateMutation.isPending}
                  data-testid="button-ai-submit"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  {generateMutation.isPending ? "Generating..." : "Generate"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-post">
                <Plus className="h-4 w-4 mr-1" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" data-testid="dialog-post-form">
              <DialogHeader>
                <DialogTitle>{editingPost ? "Edit Post" : "Create Post"}</DialogTitle>
                <DialogDescription>
                  {editingPost ? "Update your social media post" : "Create a new social media post"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="What do you want to share?"
                    rows={4}
                    data-testid="textarea-content"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Platforms</Label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => (
                      <Button
                        key={p.value}
                        type="button"
                        size="sm"
                        variant={formData.platforms.includes(p.value) ? "default" : "outline"}
                        onClick={() => togglePlatform(p.value)}
                        className="toggle-elevate"
                        data-testid={`button-platform-${p.value}`}
                      >
                        <p.icon className="h-4 w-4 mr-1" />
                        {p.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger data-testid="select-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.status === "scheduled" && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt">Schedule Time</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                      data-testid="input-scheduled-at"
                    />
                  </div>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!formData.content || createMutation.isPending || updateMutation.isPending}
                    data-testid="button-submit"
                  >
                    {editingPost ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading posts...</div>
          ) : !posts?.length ? (
            <div className="p-8 text-center text-muted-foreground">
              No posts yet. Create your first post or use AI to generate content.
            </div>
          ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Content</TableHead>
                  <TableHead>Platforms</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((post) => (
                  <TableRow key={post.id} data-testid={`row-post-${post.id}`}>
                    <TableCell className="font-medium">
                      <p className="line-clamp-2">{post.content}</p>
                    </TableCell>
                    <TableCell>{getPlatformIcons(post.platforms)}</TableCell>
                    <TableCell>{getStatusBadge(post.status || "draft")}</TableCell>
                    <TableCell>
                      {post.scheduledAt ? (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(post.scheduledAt).toLocaleDateString()}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(post)}
                          data-testid={`button-edit-${post.id}`}
                          aria-label="Edit post"
                          title="Edit post"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(post.id)}
                          data-testid={`button-delete-${post.id}`}
                          aria-label="Delete post"
                          title="Delete post"
                        >
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
        </CardContent>
      </Card>
    </div>
  );
}
