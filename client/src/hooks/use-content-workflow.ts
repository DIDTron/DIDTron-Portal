import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EmContentItem, EmContentVersion, EmPublishHistory } from "@shared/schema";

export type WorkflowStatus = "draft" | "preview" | "published" | "archived";

export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface WorkflowState {
  status: WorkflowStatus;
  isDirty: boolean;
  hasUnpublishedChanges: boolean;
  lastSavedAt: Date | null;
  lastPublishedAt: Date | null;
  currentVersion: number;
  publishedVersion: number | null;
}

export interface UseContentWorkflowOptions {
  section: "marketing" | "portal_themes" | "white_label" | "design_system" | "documentation";
  entityType: string;
  slug: string;
  onSaveSuccess?: () => void;
  onPublishSuccess?: () => void;
}

export interface UseContentWorkflowReturn {
  state: WorkflowState;
  contentItem: EmContentItem | null;
  draftData: Record<string, unknown> | null;
  publishedData: Record<string, unknown> | null;
  validationErrors: ValidationError[];
  publishHistory: EmPublishHistory[];
  isLoading: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isGeneratingPreview: boolean;
  previewUrl: string | null;
  saveDraft: (data: Record<string, unknown>, changeDescription?: string) => Promise<void>;
  launchPreview: () => Promise<string>;
  publish: (note?: string) => Promise<void>;
  revertToVersion: (versionId: string) => Promise<void>;
  discardDraft: () => void;
}

export function useContentWorkflow(options: UseContentWorkflowOptions): UseContentWorkflowReturn {
  const { section, entityType, slug, onSaveSuccess, onPublishSuccess } = options;
  const { toast } = useToast();
  const [isDirty, setIsDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Construct proper URL paths that match backend routes
  const basePath = `/api/em/content/${section}/${entityType}/${slug}`;
  const contentQueryKey = [basePath];
  const draftQueryKey = [`${basePath}/draft`];
  const publishedQueryKey = [`${basePath}/published`];
  const historyQueryKey = [`${basePath}/history`];

  const { data: contentItem, isLoading: isLoadingContent } = useQuery<EmContentItem | null>({
    queryKey: contentQueryKey,
  });

  const { data: draftVersion } = useQuery<EmContentVersion | null>({
    queryKey: draftQueryKey,
    enabled: !!contentItem?.draftVersionId,
  });

  const { data: publishedVersion } = useQuery<EmContentVersion | null>({
    queryKey: publishedQueryKey,
    enabled: !!contentItem?.publishedVersionId,
  });

  const { data: publishHistory = [] } = useQuery<EmPublishHistory[]>({
    queryKey: historyQueryKey,
  });

  const saveDraftMutation = useMutation({
    mutationFn: async ({ data, changeDescription }: { data: Record<string, unknown>; changeDescription?: string }) => {
      const res = await apiRequest("POST", `${basePath}/save-draft`, { data, changeDescription });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentQueryKey });
      queryClient.invalidateQueries({ queryKey: draftQueryKey });
      setIsDirty(false);
      setValidationErrors([]);
      toast({ title: "Draft saved", description: "Your changes have been saved as a draft." });
      onSaveSuccess?.();
    },
    onError: (error: Error) => {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    },
  });

  const generatePreviewMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `${basePath}/generate-preview`, {});
      return res.json() as Promise<{ previewUrl: string; token: string }>;
    },
    onSuccess: (data) => {
      setPreviewUrl(data.previewUrl);
      queryClient.invalidateQueries({ queryKey: contentQueryKey });
      toast({ title: "Preview ready", description: "Preview link generated successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Preview failed", description: error.message, variant: "destructive" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (note?: string) => {
      const res = await apiRequest("POST", `${basePath}/publish`, { note });
      return res.json() as Promise<{ success: boolean; validationErrors?: ValidationError[] }>;
    },
    onSuccess: (data) => {
      if (data.validationErrors && data.validationErrors.length > 0) {
        setValidationErrors(data.validationErrors);
        toast({ title: "Validation failed", description: "Please fix the errors before publishing.", variant: "destructive" });
        return;
      }
      queryClient.invalidateQueries({ queryKey: contentQueryKey });
      queryClient.invalidateQueries({ queryKey: historyQueryKey });
      queryClient.invalidateQueries({ queryKey: publishedQueryKey });
      setValidationErrors([]);
      toast({ title: "Published", description: "Your changes are now live." });
      onPublishSuccess?.();
    },
    onError: (error: Error) => {
      toast({ title: "Publish failed", description: error.message, variant: "destructive" });
    },
  });

  const revertMutation = useMutation({
    mutationFn: async (versionId: string) => {
      const res = await apiRequest("POST", `${basePath}/revert`, { versionId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentQueryKey });
      queryClient.invalidateQueries({ queryKey: historyQueryKey });
      queryClient.invalidateQueries({ queryKey: draftQueryKey });
      toast({ title: "Reverted", description: "Content has been reverted to the selected version." });
    },
    onError: (error: Error) => {
      toast({ title: "Revert failed", description: error.message, variant: "destructive" });
    },
  });

  const saveDraft = useCallback(async (data: Record<string, unknown>, changeDescription?: string) => {
    await saveDraftMutation.mutateAsync({ data, changeDescription });
  }, [saveDraftMutation]);

  const launchPreview = useCallback(async () => {
    const result = await generatePreviewMutation.mutateAsync();
    return result.previewUrl;
  }, [generatePreviewMutation]);

  const publish = useCallback(async (note?: string) => {
    await publishMutation.mutateAsync(note);
  }, [publishMutation]);

  const revertToVersion = useCallback(async (versionId: string) => {
    await revertMutation.mutateAsync(versionId);
  }, [revertMutation]);

  const discardDraft = useCallback(() => {
    setIsDirty(false);
    setValidationErrors([]);
    queryClient.invalidateQueries({ queryKey: contentQueryKey });
    queryClient.invalidateQueries({ queryKey: draftQueryKey });
  }, [contentQueryKey, draftQueryKey]);

  const state: WorkflowState = {
    status: contentItem?.status as WorkflowStatus || "draft",
    isDirty,
    hasUnpublishedChanges: !!(contentItem?.draftVersionId && contentItem.draftVersionId !== contentItem.publishedVersionId),
    lastSavedAt: draftVersion?.createdAt ? new Date(draftVersion.createdAt) : null,
    lastPublishedAt: contentItem?.lastPublishedAt ? new Date(contentItem.lastPublishedAt) : null,
    currentVersion: draftVersion?.version || 1,
    publishedVersion: publishedVersion?.version || null,
  };

  return {
    state,
    contentItem: contentItem || null,
    draftData: draftVersion?.data as Record<string, unknown> | null,
    publishedData: publishedVersion?.data as Record<string, unknown> | null,
    validationErrors,
    publishHistory,
    isLoading: isLoadingContent,
    isSaving: saveDraftMutation.isPending,
    isPublishing: publishMutation.isPending,
    isGeneratingPreview: generatePreviewMutation.isPending,
    previewUrl,
    saveDraft,
    launchPreview,
    publish,
    revertToVersion,
    discardDraft,
  };
}
