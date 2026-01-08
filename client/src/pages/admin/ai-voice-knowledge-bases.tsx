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
import { 
  Plus, Pencil, Trash2, BookOpen, Brain, FileText, Upload, Play, 
  RefreshCw, CheckCircle2, Clock, AlertCircle, Loader2
} from "lucide-react";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import type { Customer } from "@shared/schema";

type KnowledgeBase = {
  id: string;
  customerId: string;
  name: string;
  description: string | null;
  status: string | null;
  documentCount: number | null;
  totalTokens: number | null;
  learnedTopics: string[] | null;
  extractedFaqs: { question: string; answer: string }[] | null;
  keyPhrases: string[] | null;
  confidenceScore: number | null;
  trainingSummary: string | null;
  lastTrainedAt: string | null;
  createdAt: string;
};

type KbFormData = {
  customerId: string;
  name: string;
  description: string;
};

const defaultForm: KbFormData = {
  customerId: "",
  name: "",
  description: "",
};

function getStatusBadge(status: string | null) {
  switch (status) {
    case "ready":
      return <Badge variant="default"><CheckCircle2 className="h-3 w-3 mr-1" />Ready</Badge>;
    case "processing":
      return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>;
    case "pending":
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case "error":
      return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
    default:
      return <Badge variant="outline">{status || "Unknown"}</Badge>;
  }
}

export default function AiVoiceKnowledgeBasesPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedKb, setSelectedKb] = useState<KnowledgeBase | null>(null);
  const [form, setForm] = useState<KbFormData>(defaultForm);

  const { data: knowledgeBases = [], isLoading } = useQuery<KnowledgeBase[]>({
    queryKey: ["/api/admin/ai-voice/knowledge-bases"],
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(knowledgeBases);

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: KbFormData) => {
      const res = await apiRequest("POST", "/api/admin/ai-voice/knowledge-bases", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-voice/knowledge-bases"] });
      toast({ title: "Knowledge base created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create knowledge base", description: error.message, variant: "destructive" });
    },
  });

  const trainMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/ai-voice/knowledge-bases/${id}/train`);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-voice/knowledge-bases"] });
      toast({ 
        title: "Training complete", 
        description: `Confidence score: ${data.confidenceScore ? Math.round(data.confidenceScore * 100) + '%' : 'N/A'}`
      });
    },
    onError: (error: Error) => {
      toast({ title: "Training failed", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/ai-voice/knowledge-bases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/ai-voice/knowledge-bases"] });
      toast({ title: "Knowledge base deleted" });
      setSelectedKb(null);
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setForm(defaultForm);
    setIsOpen(false);
  };

  const handleSubmit = () => {
    if (!form.customerId || !form.name) {
      toast({ title: "Customer and name are required", variant: "destructive" });
      return;
    }
    createMutation.mutate(form);
  };

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.companyName || "Unknown";
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
          <h1 className="text-2xl font-semibold">Knowledge Bases</h1>
          <p className="text-muted-foreground">Train AI agents with custom knowledge</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-kb" onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Knowledge Base
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Knowledge Base</DialogTitle>
              <DialogDescription>Create a new knowledge base for AI training</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select value={form.customerId} onValueChange={(v) => setForm({ ...form, customerId: v })}>
                  <SelectTrigger data-testid="select-kb-customer">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  data-testid="input-kb-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Product Documentation"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  data-testid="input-kb-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the knowledge base purpose..."
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button
                data-testid="button-save-kb"
                onClick={handleSubmit}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Knowledge Base"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Total Knowledge Bases</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledgeBases.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Ready</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {knowledgeBases.filter(kb => kb.status === "ready").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Loader2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {knowledgeBases.filter(kb => kb.status === "processing").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Knowledge Bases</CardTitle>
            <CardDescription>Manage knowledge sources for AI training</CardDescription>
          </CardHeader>
          <CardContent>
            {knowledgeBases.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Knowledge Bases</h3>
                <p className="text-muted-foreground mb-4">
                  Create a knowledge base to train AI agents
                </p>
                <Button data-testid="button-create-first-kb" onClick={() => setIsOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Knowledge Base
                </Button>
              </div>
            ) : (
              <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map(kb => (
                    <TableRow 
                      key={kb.id} 
                      data-testid={`row-kb-${kb.id}`}
                      className={selectedKb?.id === kb.id ? "bg-muted/50" : "cursor-pointer"}
                      onClick={() => setSelectedKb(kb)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-md bg-primary/10">
                            <BookOpen className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{kb.name}</div>
                            {kb.description && (
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {kb.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getCustomerName(kb.customerId)}</TableCell>
                      <TableCell>{kb.documentCount || 0}</TableCell>
                      <TableCell>{getStatusBadge(kb.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            data-testid={`button-train-${kb.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              trainMutation.mutate(kb.id);
                            }}
                            disabled={trainMutation.isPending}
                            title="Train"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            data-testid={`button-delete-kb-${kb.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Delete this knowledge base?")) {
                                deleteMutation.mutate(kb.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Training Insights
            </CardTitle>
            <CardDescription>
              {selectedKb ? selectedKb.name : "Select a knowledge base"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedKb ? (
              <div className="space-y-4">
                {selectedKb.confidenceScore && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confidence Score</span>
                      <span>{Math.round(selectedKb.confidenceScore * 100)}%</span>
                    </div>
                    <Progress value={selectedKb.confidenceScore * 100} className="h-2" />
                  </div>
                )}
                
                {selectedKb.trainingSummary && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Training Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedKb.trainingSummary}
                    </p>
                  </div>
                )}
                
                {selectedKb.learnedTopics && selectedKb.learnedTopics.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Learned Topics</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedKb.learnedTopics.map((topic, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedKb.keyPhrases && selectedKb.keyPhrases.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Key Phrases</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedKb.keyPhrases.slice(0, 10).map((phrase, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {phrase}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedKb.extractedFaqs && selectedKb.extractedFaqs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Extracted FAQs</h4>
                    <div className="space-y-2">
                      {selectedKb.extractedFaqs.slice(0, 3).map((faq, i) => (
                        <div key={i} className="text-sm">
                          <div className="font-medium">{faq.question}</div>
                          <div className="text-muted-foreground line-clamp-2">
                            {faq.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {!selectedKb.confidenceScore && !selectedKb.trainingSummary && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No training data yet</p>
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => trainMutation.mutate(selectedKb.id)}
                      disabled={trainMutation.isPending}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Start Training
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                Select a knowledge base to view training insights
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
