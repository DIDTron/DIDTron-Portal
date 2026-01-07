import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, Upload, FileText, Link2, Brain, Sparkles, Loader2,
  CheckCircle2, Clock, AlertCircle, BookOpen, Trash2, Eye, RefreshCw
} from "lucide-react";

type KnowledgeBase = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  documentCount: number;
  totalTokens: number;
  lastTrainedAt: string | null;
  learnedTopics: string[] | null;
  extractedFaqs: { question: string; answer: string }[] | null;
  keyPhrases: string[] | null;
  confidenceScore: number | null;
  trainingSummary: string | null;
  createdAt: string;
};

type KbSource = {
  id: string;
  knowledgeBaseId: string;
  name: string;
  sourceType: string;
  sourceUrl: string | null;
  content: string | null;
  status: string;
  createdAt: string;
};

type FormData = {
  name: string;
  description: string;
};

const defaultForm: FormData = {
  name: "",
  description: "",
};

export default function CustomerKnowledgeWorkspace() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [selectedKb, setSelectedKb] = useState<KnowledgeBase | null>(null);
  const [viewingInsights, setViewingInsights] = useState<KnowledgeBase | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [sourceForm, setSourceForm] = useState({ name: "", type: "text", content: "", url: "" });

  const { data: knowledgeBases = [], isLoading } = useQuery<KnowledgeBase[]>({
    queryKey: ["/api/my/ai-voice/knowledge-bases"],
  });

  const { data: sources = [] } = useQuery<KbSource[]>({
    queryKey: ["/api/my/ai-voice/knowledge-bases", selectedKb?.id, "sources"],
    enabled: !!selectedKb,
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/my/ai-voice/knowledge-bases", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/knowledge-bases"] });
      toast({ title: "Knowledge base created successfully" });
      setIsCreateOpen(false);
      setForm(defaultForm);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create knowledge base", description: error.message, variant: "destructive" });
    },
  });

  const trainMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/my/ai-voice/knowledge-bases/${id}/train`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/knowledge-bases"] });
      toast({ title: "Training started", description: "You'll be notified when complete" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to start training", description: error.message, variant: "destructive" });
    },
  });

  const addSourceMutation = useMutation({
    mutationFn: async (data: { kbId: string; source: object }) => {
      const res = await apiRequest("POST", `/api/my/ai-voice/knowledge-bases/${data.kbId}/sources`, data.source);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/knowledge-bases"] });
      toast({ title: "Source added successfully" });
      setIsSourceOpen(false);
      setSourceForm({ name: "", type: "text", content: "", url: "" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add source", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/my/ai-voice/knowledge-bases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/knowledge-bases"] });
      toast({ title: "Knowledge base deleted" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Ready</Badge>;
      case "processing":
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
      case "pending":
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "failed":
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Knowledge Workspace</h1>
          <p className="text-muted-foreground">
            Train your AI agents with documents, FAQs, and custom content
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-kb">
          <Plus className="h-4 w-4 mr-2" />
          Create Knowledge Base
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Knowledge Bases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledgeBases.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {knowledgeBases.filter(kb => kb.status === "ready").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {knowledgeBases.reduce((sum, kb) => sum + kb.documentCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {knowledgeBases.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Knowledge Bases Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create a knowledge base to train your AI agents with your content
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Knowledge Base
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {knowledgeBases.map((kb) => (
            <Card key={kb.id} data-testid={`card-kb-${kb.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{kb.name}</CardTitle>
                  {getStatusBadge(kb.status)}
                </div>
                <CardDescription>{kb.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Documents</span>
                  <span className="font-medium">{kb.documentCount}</span>
                </div>
                {kb.confidenceScore && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">{(kb.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={kb.confidenceScore * 100} className="h-1" />
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedKb(kb);
                      setIsSourceOpen(true);
                    }}
                    data-testid={`button-add-source-${kb.id}`}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => trainMutation.mutate(kb.id)}
                    disabled={trainMutation.isPending}
                    data-testid={`button-train-${kb.id}`}
                  >
                    {trainMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Train
                  </Button>
                  {kb.status === "ready" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingInsights(kb)}
                      data-testid={`button-insights-${kb.id}`}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Insights
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(kb.id)}
                    data-testid={`button-delete-${kb.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Knowledge Base</DialogTitle>
            <DialogDescription>
              Set up a new knowledge base to train your AI agents
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Product FAQs"
                data-testid="input-kb-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What content will this knowledge base contain?"
                data-testid="input-kb-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.name}
              data-testid="button-create-submit"
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSourceOpen} onOpenChange={setIsSourceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Source</DialogTitle>
            <DialogDescription>
              Add content to {selectedKb?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Source Name</Label>
              <Input
                value={sourceForm.name}
                onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })}
                placeholder="e.g., Return Policy"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={sourceForm.type} onValueChange={(v) => setSourceForm({ ...sourceForm, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Content</SelectItem>
                  <SelectItem value="url">Website URL</SelectItem>
                  <SelectItem value="faq">FAQ Entry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {sourceForm.type === "url" ? (
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={sourceForm.url}
                  onChange={(e) => setSourceForm({ ...sourceForm, url: e.target.value })}
                  placeholder="https://example.com/page"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={sourceForm.content}
                  onChange={(e) => setSourceForm({ ...sourceForm, content: e.target.value })}
                  placeholder="Enter the content here..."
                  rows={5}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSourceOpen(false)}>Cancel</Button>
            <Button
              onClick={() => selectedKb && addSourceMutation.mutate({
                kbId: selectedKb.id,
                source: {
                  name: sourceForm.name,
                  sourceType: sourceForm.type,
                  content: sourceForm.content,
                  sourceUrl: sourceForm.url,
                },
              })}
              disabled={addSourceMutation.isPending}
            >
              {addSourceMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Source
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingInsights} onOpenChange={() => setViewingInsights(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Training Insights: {viewingInsights?.name}
            </DialogTitle>
            <DialogDescription>
              What your AI learned from the training data
            </DialogDescription>
          </DialogHeader>
          {viewingInsights && (
            <div className="space-y-6">
              {viewingInsights.trainingSummary && (
                <div className="space-y-2">
                  <h4 className="font-medium">Training Summary</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                    {viewingInsights.trainingSummary}
                  </p>
                </div>
              )}

              {viewingInsights.learnedTopics && viewingInsights.learnedTopics.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Learned Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingInsights.learnedTopics.map((topic, i) => (
                      <Badge key={i} variant="secondary">{topic}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {viewingInsights.keyPhrases && viewingInsights.keyPhrases.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Key Phrases</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingInsights.keyPhrases.map((phrase, i) => (
                      <Badge key={i} variant="outline">{phrase}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {viewingInsights.extractedFaqs && viewingInsights.extractedFaqs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Extracted FAQs</h4>
                  <div className="space-y-3">
                    {viewingInsights.extractedFaqs.map((faq, i) => (
                      <div key={i} className="bg-muted p-3 rounded-md">
                        <p className="font-medium text-sm">Q: {faq.question}</p>
                        <p className="text-sm text-muted-foreground mt-1">A: {faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingInsights.confidenceScore && (
                <div className="space-y-2">
                  <h4 className="font-medium">Confidence Score</h4>
                  <div className="flex items-center gap-4">
                    <Progress value={viewingInsights.confidenceScore * 100} className="flex-1" />
                    <span className="font-medium">{(viewingInsights.confidenceScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewingInsights(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
