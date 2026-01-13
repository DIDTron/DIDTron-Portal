import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Palette, 
  Building2, 
  Settings2,
  Globe,
  Image,
  BookOpen,
  PenTool,
  Eye,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  LayoutDashboard,
  RefreshCw
} from "lucide-react";
import type { EmContentItem } from "@shared/schema";

export default function ExperienceManagerPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isPublishing, setIsPublishing] = useState(false);

  const { data: contentItems = [], isLoading } = useQuery<EmContentItem[]>({
    queryKey: ["/api/em/content-items"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const recentChanges = [...contentItems]
    .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    .slice(0, 5);

  const getCountBySection = (section: string) => contentItems.filter(item => item.section === section).length;
  const getDraftCountBySection = (section: string) => contentItems.filter(item => item.section === section && item.status === "draft").length;
  const getPublishedCountBySection = (section: string) => contentItems.filter(item => item.section === section && item.status === "published").length;
  const getPreviewCountBySection = (section: string) => contentItems.filter(item => item.section === section && item.status === "preview").length;

  const getSectionIcon = (section: string) => {
    switch (section) {
      case "marketing": return Globe;
      case "portal_themes": return Palette;
      case "white_label": return Building2;
      case "design_system": return Settings2;
      case "documentation": return BookOpen;
      default: return FileText;
    }
  };

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      case "preview":
        return <Badge variant="outline"><Eye className="h-3 w-3 mr-1" />Preview</Badge>;
      case "published":
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Published</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const draftItems = contentItems.filter(item => item.status === "draft");
  const hasUnpublishedChanges = draftItems.length > 0 || contentItems.filter(item => item.status === "preview").length > 0;

  const handlePreviewAll = () => {
    if (draftItems.length === 0) {
      toast({
        title: "No drafts to preview",
        description: "All content is already published or in preview mode.",
      });
      return;
    }
    toast({
      title: "Preview Mode",
      description: `${draftItems.length} draft item(s) are ready for preview. Navigate to each section to preview individual items.`,
    });
  };

  const publishAllMutation = useMutation({
    mutationFn: async () => {
      const unpublished = contentItems.filter(item => item.status !== "published");
      const results = await Promise.all(
        unpublished.map(item => 
          apiRequest("POST", `/api/em/content/${item.section}/${item.entityType}/${item.slug}/publish`, { changeDescription: "Bulk publish from Experience Manager" })
        )
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/em/content-items"] });
      toast({
        title: "Published successfully",
        description: "All content has been published.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Publish failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePublishAll = () => {
    if (!hasUnpublishedChanges) {
      toast({
        title: "Nothing to publish",
        description: "All content is already published.",
      });
      return;
    }
    publishAllMutation.mutate();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Experience Manager</h1>
          <p className="text-sm text-muted-foreground">Control your marketing website, portal themes, and design system</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            data-testid="button-preview-all"
            onClick={handlePreviewAll}
            disabled={draftItems.length === 0}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Changes
            {draftItems.length > 0 && <Badge variant="secondary" className="ml-2">{draftItems.length}</Badge>}
          </Button>
          <Button 
            data-testid="button-publish-all"
            onClick={handlePublishAll}
            disabled={!hasUnpublishedChanges || publishAllMutation.isPending}
          >
            {publishAllMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Publish All
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card 
            className="hover-elevate cursor-pointer" 
            data-testid="card-marketing-website"
            onClick={() => setLocation("/admin/experience-manager/marketing")}
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2 rounded-md bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">Marketing Website</CardTitle>
                <CardDescription className="text-xs">Landing pages, blog, docs</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{getCountBySection("marketing")} pages</span>
                {getDraftCountBySection("marketing") > 0 ? (
                  <Badge variant="secondary">{getDraftCountBySection("marketing")} drafts</Badge>
                ) : (
                  <Badge variant="default">All live</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer" 
            data-testid="card-portal-themes"
            onClick={() => setLocation("/admin/experience-manager/portal-themes")}
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2 rounded-md bg-chart-4/10">
                <Palette className="h-5 w-5 text-chart-4" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">Portal Themes</CardTitle>
                <CardDescription className="text-xs">Colors, logos, layouts</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{getCountBySection("portal_themes")} themes</span>
                {getDraftCountBySection("portal_themes") > 0 ? (
                  <Badge variant="secondary">{getDraftCountBySection("portal_themes")} drafts</Badge>
                ) : (
                  <Badge variant="default">{getPublishedCountBySection("portal_themes")} live</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer" 
            data-testid="card-white-label"
            onClick={() => setLocation("/admin/experience-manager/white-label")}
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2 rounded-md bg-chart-2/10">
                <Building2 className="h-5 w-5 text-chart-2" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">White-Label</CardTitle>
                <CardDescription className="text-xs">Customer branding</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{getCountBySection("white_label")} brands</span>
                {getPreviewCountBySection("white_label") > 0 ? (
                  <Badge variant="secondary">{getPreviewCountBySection("white_label")} pending</Badge>
                ) : (
                  <Badge variant="default">All live</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer" 
            data-testid="card-design-system"
            onClick={() => setLocation("/admin/experience-manager/design-system")}
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2 rounded-md bg-chart-3/10">
                <Settings2 className="h-5 w-5 text-chart-3" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">Design System</CardTitle>
                <CardDescription className="text-xs">Components, tokens</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{getCountBySection("design_system")} items</span>
                <Badge variant="default">Healthy</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Changes</CardTitle>
                <CardDescription>Track and manage your draft, pending, and published changes</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-md border">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>
                    ))}
                  </div>
                ) : recentChanges.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No recent changes</p>
                    <p className="text-xs text-muted-foreground">Start editing content to see changes here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentChanges.map((change) => {
                      const Icon = getSectionIcon(change.section);
                      return (
                        <div key={change.id} className="flex items-center justify-between p-3 rounded-md border" data-testid={`row-change-${change.id}`}>
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-muted">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{change.name}</p>
                              <p className="text-xs text-muted-foreground">{change.section} / {change.entityType}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">{formatTimeAgo(change.updatedAt)}</span>
                            {getStatusBadge(change.status || "draft")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" data-testid="button-new-landing-page">
                  <FileText className="h-4 w-4 mr-2" />
                  New Landing Page
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-edit-theme">
                  <Palette className="h-4 w-4 mr-2" />
                  Edit Portal Theme
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-add-brand">
                  <Building2 className="h-4 w-4 mr-2" />
                  Add White-Label Brand
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-upload-media">
                  <Image className="h-4 w-4 mr-2" />
                  Upload Media
                </Button>
                <Button variant="outline" className="w-full justify-start" data-testid="button-view-docs">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Documentation
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">UI Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-bold text-chart-2">94%</span>
                  <Badge variant="default">Healthy</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Components adopted</span>
                    <span className="font-medium">47/50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dark mode ready</span>
                    <span className="font-medium">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accessibility score</span>
                    <span className="font-medium">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
