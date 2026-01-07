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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Play, Pause, Trash2, Users, Phone, Upload, Loader2,
  CheckCircle2, Clock, AlertCircle, UserPlus, FileText
} from "lucide-react";

type Campaign = {
  id: string;
  name: string;
  description: string | null;
  agentId: string;
  status: string;
  totalContacts: number;
  contactsCalled: number;
  contactsRemaining: number;
  successfulCalls: number;
  failedCalls: number;
  scheduledAt: string | null;
  createdAt: string;
};

type Phonebook = {
  id: string;
  name: string;
  description: string | null;
  contactCount: number;
  createdAt: string;
};

type Contact = {
  id: string;
  phonebookId: string;
  name: string;
  phoneNumber: string;
  email: string | null;
  metadata: Record<string, string> | null;
  createdAt: string;
};

type Agent = { id: string; name: string };

export default function CustomerCampaignsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("campaigns");
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [isPhonebookOpen, setIsPhonebookOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [selectedPhonebook, setSelectedPhonebook] = useState<Phonebook | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    name: "", description: "", agentId: "", phonebookId: "", maxConcurrentCalls: 5
  });
  const [phonebookForm, setPhonebookForm] = useState({ name: "", description: "" });
  const [contactForm, setContactForm] = useState({ name: "", phoneNumber: "", email: "" });
  const [bulkContacts, setBulkContacts] = useState("");

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/my/ai-voice/campaigns"],
  });

  const { data: phonebooks = [], isLoading: phonebooksLoading } = useQuery<Phonebook[]>({
    queryKey: ["/api/my/ai-voice/phonebooks"],
  });

  const { data: agents = [] } = useQuery<Agent[]>({
    queryKey: ["/api/my/ai-voice/agents"],
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/my/ai-voice/phonebooks", selectedPhonebook?.id, "contacts"],
    enabled: !!selectedPhonebook,
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: typeof campaignForm) => {
      const res = await apiRequest("POST", "/api/my/ai-voice/campaigns", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/campaigns"] });
      toast({ title: "Campaign created successfully" });
      setIsCampaignOpen(false);
      setCampaignForm({ name: "", description: "", agentId: "", phonebookId: "", maxConcurrentCalls: 5 });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create campaign", description: error.message, variant: "destructive" });
    },
  });

  const startCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/my/ai-voice/campaigns/${id}/start`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/campaigns"] });
      toast({ title: "Campaign started" });
    },
  });

  const pauseCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/my/ai-voice/campaigns/${id}/pause`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/campaigns"] });
      toast({ title: "Campaign paused" });
    },
  });

  const createPhonebookMutation = useMutation({
    mutationFn: async (data: typeof phonebookForm) => {
      const res = await apiRequest("POST", "/api/my/ai-voice/phonebooks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/phonebooks"] });
      toast({ title: "Phonebook created successfully" });
      setIsPhonebookOpen(false);
      setPhonebookForm({ name: "", description: "" });
    },
  });

  const addContactMutation = useMutation({
    mutationFn: async (data: { phonebookId: string; contact: typeof contactForm }) => {
      const res = await apiRequest("POST", `/api/my/ai-voice/phonebooks/${data.phonebookId}/contacts`, data.contact);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/ai-voice/phonebooks"] });
      toast({ title: "Contact added successfully" });
      setContactForm({ name: "", phoneNumber: "", email: "" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge className="bg-green-600"><Play className="h-3 w-3 mr-1" />Running</Badge>;
      case "paused":
        return <Badge variant="secondary"><Pause className="h-3 w-3 mr-1" />Paused</Badge>;
      case "completed":
        return <Badge variant="outline"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case "scheduled":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Scheduled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Campaigns & Phonebooks</h1>
          <p className="text-muted-foreground">
            Manage outbound calling campaigns and contact lists
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns" data-testid="tab-campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="phonebooks" data-testid="tab-phonebooks">Phonebooks</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsCampaignOpen(true)} data-testid="button-create-campaign">
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{campaigns.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {campaigns.filter(c => c.status === "running").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Contacts Called</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {campaigns.reduce((sum, c) => sum + c.contactsCalled, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {campaigns.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Campaigns Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create a campaign to start making outbound calls
                </p>
                <Button onClick={() => setIsCampaignOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id} data-testid={`row-campaign-${campaign.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.name}</p>
                          <p className="text-xs text-muted-foreground">{campaign.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {agents.find(a => a.id === campaign.agentId)?.name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress 
                            value={(campaign.contactsCalled / Math.max(campaign.totalContacts, 1)) * 100} 
                            className="h-2 w-24"
                          />
                          <p className="text-xs text-muted-foreground">
                            {campaign.contactsCalled} / {campaign.totalContacts}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {campaign.status === "running" ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => pauseCampaignMutation.mutate(campaign.id)}
                              data-testid={`button-pause-${campaign.id}`}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                          ) : campaign.status !== "completed" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startCampaignMutation.mutate(campaign.id)}
                              data-testid={`button-start-${campaign.id}`}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="phonebooks" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsPhonebookOpen(true)} data-testid="button-create-phonebook">
              <Plus className="h-4 w-4 mr-2" />
              Create Phonebook
            </Button>
          </div>

          {phonebooks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Phonebooks Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create a phonebook to manage your contacts
                </p>
                <Button onClick={() => setIsPhonebookOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Phonebook
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {phonebooks.map((pb) => (
                <Card key={pb.id} data-testid={`card-phonebook-${pb.id}`}>
                  <CardHeader>
                    <CardTitle className="text-base">{pb.name}</CardTitle>
                    <CardDescription>{pb.description || "No description"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{pb.contactCount} contacts</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPhonebook(pb);
                          setIsContactsOpen(true);
                        }}
                        data-testid={`button-manage-${pb.id}`}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isCampaignOpen} onOpenChange={setIsCampaignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
            <DialogDescription>Set up a new outbound calling campaign</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign Name</Label>
              <Input
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                placeholder="e.g., Q1 Sales Outreach"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={campaignForm.description}
                onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Agent</Label>
                <Select
                  value={campaignForm.agentId}
                  onValueChange={(v) => setCampaignForm({ ...campaignForm, agentId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phonebook</Label>
                <Select
                  value={campaignForm.phonebookId}
                  onValueChange={(v) => setCampaignForm({ ...campaignForm, phonebookId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select phonebook" />
                  </SelectTrigger>
                  <SelectContent>
                    {phonebooks.map((pb) => (
                      <SelectItem key={pb.id} value={pb.id}>{pb.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Max Concurrent Calls</Label>
              <Input
                type="number"
                value={campaignForm.maxConcurrentCalls}
                onChange={(e) => setCampaignForm({ ...campaignForm, maxConcurrentCalls: parseInt(e.target.value) || 5 })}
                min={1}
                max={50}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCampaignOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createCampaignMutation.mutate(campaignForm)}
              disabled={createCampaignMutation.isPending || !campaignForm.name || !campaignForm.agentId}
            >
              {createCampaignMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPhonebookOpen} onOpenChange={setIsPhonebookOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Phonebook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={phonebookForm.name}
                onChange={(e) => setPhonebookForm({ ...phonebookForm, name: e.target.value })}
                placeholder="e.g., Sales Leads"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={phonebookForm.description}
                onChange={(e) => setPhonebookForm({ ...phonebookForm, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPhonebookOpen(false)}>Cancel</Button>
            <Button
              onClick={() => createPhonebookMutation.mutate(phonebookForm)}
              disabled={createPhonebookMutation.isPending || !phonebookForm.name}
            >
              {createPhonebookMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isContactsOpen} onOpenChange={setIsContactsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Contacts: {selectedPhonebook?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                placeholder="Name"
              />
              <Input
                value={contactForm.phoneNumber}
                onChange={(e) => setContactForm({ ...contactForm, phoneNumber: e.target.value })}
                placeholder="Phone number"
              />
              <Button
                onClick={() => selectedPhonebook && addContactMutation.mutate({
                  phonebookId: selectedPhonebook.id,
                  contact: contactForm,
                })}
                disabled={addContactMutation.isPending || !contactForm.phoneNumber}
              >
                {addContactMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No contacts yet
                    </TableCell>
                  </TableRow>
                ) : (
                  contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>{contact.name}</TableCell>
                      <TableCell>{contact.phoneNumber}</TableCell>
                      <TableCell>{contact.email || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsContactsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
