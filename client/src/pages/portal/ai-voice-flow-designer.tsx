import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Plus, Trash2, Save, Play, MessageSquare, PhoneCall, GitBranch,
  Clock, Settings2, Volume2, UserCircle, ArrowRight, Loader2, Zap
} from "lucide-react";

type FlowNode = {
  id: string;
  type: "greeting" | "menu" | "question" | "transfer" | "hangup" | "condition" | "action";
  label: string;
  content: string;
  options?: { key: string; label: string; nextNodeId: string }[];
  nextNodeId?: string;
  position: { x: number; y: number };
};

type Flow = {
  id: string;
  name: string;
  nodes: FlowNode[];
  agentId: string;
};

const NODE_TYPES = [
  { type: "greeting", label: "Greeting", icon: Volume2, color: "bg-green-500" },
  { type: "menu", label: "Menu Options", icon: GitBranch, color: "bg-blue-500" },
  { type: "question", label: "Ask Question", icon: MessageSquare, color: "bg-purple-500" },
  { type: "transfer", label: "Transfer Call", icon: PhoneCall, color: "bg-orange-500" },
  { type: "condition", label: "Condition", icon: Zap, color: "bg-yellow-500" },
  { type: "action", label: "Custom Action", icon: Settings2, color: "bg-pink-500" },
  { type: "hangup", label: "End Call", icon: Clock, color: "bg-red-500" },
] as const;

const defaultNode = (type: FlowNode["type"], index: number): FlowNode => ({
  id: `node-${Date.now()}-${index}`,
  type,
  label: NODE_TYPES.find(n => n.type === type)?.label || "Node",
  content: "",
  position: { x: 100 + (index * 50), y: 100 + (index * 80) },
  options: type === "menu" ? [{ key: "1", label: "Option 1", nextNodeId: "" }] : undefined,
});

export default function FlowDesignerPage() {
  const { toast } = useToast();
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isNodeDialogOpen, setIsNodeDialogOpen] = useState(false);
  const [flowName, setFlowName] = useState("New Flow");

  const { data: agents = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["/api/my/ai-voice/agents"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { agentId: string; flowConfig: object }) => {
      const res = await apiRequest("PATCH", `/api/my/ai-voice/agents/${data.agentId}`, {
        flowConfig: data.flowConfig,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/agents"] });
      toast({ title: "Flow saved successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save flow", description: error.message, variant: "destructive" });
    },
  });

  const addNode = (type: FlowNode["type"]) => {
    const newNode = defaultNode(type, nodes.length);
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode);
    setIsNodeDialogOpen(true);
  };

  const updateNode = (updated: FlowNode) => {
    setNodes(nodes.map(n => n.id === updated.id ? updated : n));
    setSelectedNode(null);
    setIsNodeDialogOpen(false);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  const handleSave = () => {
    if (!selectedAgentId) {
      toast({ title: "Please select an agent", variant: "destructive" });
      return;
    }
    saveMutation.mutate({
      agentId: selectedAgentId,
      flowConfig: { name: flowName, nodes },
    });
  };

  const getNodeIcon = (type: FlowNode["type"]) => {
    const nodeType = NODE_TYPES.find(n => n.type === type);
    return nodeType?.icon || MessageSquare;
  };

  const getNodeColor = (type: FlowNode["type"]) => {
    const nodeType = NODE_TYPES.find(n => n.type === type);
    return nodeType?.color || "bg-gray-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Visual Flow Designer</h1>
          <p className="text-muted-foreground">
            Build conversation flows for your AI agents using a visual editor
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
            <SelectTrigger className="w-[200px]" data-testid="select-agent">
              <SelectValue placeholder="Select Agent" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save-flow">
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Flow
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Node Library</CardTitle>
            <CardDescription>Drag or click to add nodes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {NODE_TYPES.map((nodeType) => {
              const Icon = nodeType.icon;
              return (
                <Button
                  key={nodeType.type}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => addNode(nodeType.type as FlowNode["type"])}
                  data-testid={`button-add-${nodeType.type}`}
                >
                  <div className={`p-1 rounded mr-2 ${nodeType.color}`}>
                    <Icon className="h-3 w-3 text-white" />
                  </div>
                  {nodeType.label}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Input
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  className="w-48"
                  data-testid="input-flow-name"
                />
                <Badge variant="outline">{nodes.length} nodes</Badge>
              </div>
              <Button variant="outline" size="sm" data-testid="button-preview">
                <Play className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="min-h-[500px] border rounded-md bg-muted/30 p-4 relative"
              data-testid="canvas-flow"
            >
              {nodes.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Add nodes from the library to build your flow</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {nodes.map((node, index) => {
                    const Icon = getNodeIcon(node.type);
                    return (
                      <div
                        key={node.id}
                        className="flex items-center gap-4"
                        data-testid={`node-${node.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded ${getNodeColor(node.type)}`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{node.label}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                              {node.content || "No content set"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-auto">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedNode(node);
                              setIsNodeDialogOpen(true);
                            }}
                            data-testid={`button-edit-node-${node.id}`}
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNode(node.id)}
                            data-testid={`button-delete-node-${node.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {index < nodes.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground absolute right-4" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isNodeDialogOpen} onOpenChange={setIsNodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Node</DialogTitle>
            <DialogDescription>
              Set up the content and behavior for this node
            </DialogDescription>
          </DialogHeader>
          {selectedNode && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Label</Label>
                <Input
                  value={selectedNode.label}
                  onChange={(e) => setSelectedNode({ ...selectedNode, label: e.target.value })}
                  data-testid="input-node-label"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {selectedNode.type === "greeting" ? "Greeting Message" :
                   selectedNode.type === "question" ? "Question to Ask" :
                   selectedNode.type === "menu" ? "Menu Prompt" :
                   "Content"}
                </Label>
                <Textarea
                  value={selectedNode.content}
                  onChange={(e) => setSelectedNode({ ...selectedNode, content: e.target.value })}
                  placeholder={
                    selectedNode.type === "greeting" ? "Hello! Thank you for calling..." :
                    selectedNode.type === "question" ? "What is your account number?" :
                    "Enter node content..."
                  }
                  data-testid="input-node-content"
                />
              </div>
              {selectedNode.type === "menu" && (
                <div className="space-y-2">
                  <Label>Menu Options</Label>
                  <div className="space-y-2">
                    {(selectedNode.options || []).map((opt, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={opt.key}
                          onChange={(e) => {
                            const opts = [...(selectedNode.options || [])];
                            opts[idx] = { ...opt, key: e.target.value };
                            setSelectedNode({ ...selectedNode, options: opts });
                          }}
                          placeholder="Key"
                          className="w-16"
                        />
                        <Input
                          value={opt.label}
                          onChange={(e) => {
                            const opts = [...(selectedNode.options || [])];
                            opts[idx] = { ...opt, label: e.target.value };
                            setSelectedNode({ ...selectedNode, options: opts });
                          }}
                          placeholder="Option label"
                        />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const opts = [...(selectedNode.options || [])];
                        opts.push({ key: String(opts.length + 1), label: "", nextNodeId: "" });
                        setSelectedNode({ ...selectedNode, options: opts });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>
              )}
              {selectedNode.type === "transfer" && (
                <div className="space-y-2">
                  <Label>Transfer Destination</Label>
                  <Input
                    value={selectedNode.content}
                    onChange={(e) => setSelectedNode({ ...selectedNode, content: e.target.value })}
                    placeholder="Extension or phone number"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNodeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedNode && updateNode(selectedNode)} data-testid="button-save-node">
              Save Node
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
