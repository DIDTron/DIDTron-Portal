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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Plus, Mail, Pencil, Trash2, Eye, Send, Download, Loader2 } from "lucide-react";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import type { EmailTemplate } from "@shared/schema";

type TemplateFormData = {
  name: string;
  slug: string;
  subject: string;
  htmlContent: string;
  category: string;
  isActive: boolean;
  variables?: string[];
};

export default function EmailTemplatesPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [testEmailOpen, setTestEmailOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
    slug: "",
    subject: "",
    htmlContent: "",
    category: "general",
    isActive: true,
    variables: [],
  });

  const { data: templates, isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email-templates"],
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(templates ?? []);

  const createMutation = useMutation({
    mutationFn: async (data: TemplateFormData) => {
      const res = await apiRequest("POST", "/api/email-templates", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({ title: "Email template created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create email template", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TemplateFormData }) => {
      const res = await apiRequest("PATCH", `/api/email-templates/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({ title: "Email template updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update email template", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/email-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({ title: "Email template deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete email template", description: error.message, variant: "destructive" });
    },
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/email-templates/seed", {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-templates"] });
      toast({ 
        title: "Templates seeded successfully",
        description: `Created ${data.created} templates, ${data.skipped} already existed.`
      });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to seed templates", description: error.message, variant: "destructive" });
    },
  });

  const sendTestMutation = useMutation({
    mutationFn: async ({ id, email }: { id: string; email: string }) => {
      const res = await apiRequest("POST", `/api/email-templates/${id}/send-test`, { email });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Test email sent successfully" });
      setTestEmailOpen(false);
      setTestEmail("");
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send test email", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      subject: "",
      htmlContent: "",
      category: "general",
      isActive: true,
      variables: [],
    });
    setEditingTemplate(null);
    setIsOpen(false);
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      slug: template.slug,
      subject: template.subject,
      htmlContent: template.htmlContent || "",
      category: template.category || "general",
      isActive: template.isActive ?? true,
      variables: template.variables || [],
    });
    setIsOpen(true);
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const handleSendTest = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setTestEmailOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const categoryColors: Record<string, string> = {
    onboarding: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    billing: "bg-green-500/10 text-green-500 border-green-500/20",
    security: "bg-red-500/10 text-red-500 border-red-500/20",
    compliance: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    rewards: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    reports: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
    general: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-4" data-testid="email-templates-page">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold" data-testid="text-page-title">Email Templates</h2>
          <Badge variant="outline" className="ml-2">{templates?.length || 0} templates</Badge>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            data-testid="button-seed-templates"
          >
            {seedMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            Seed Default Templates
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-template">
                <Plus className="h-4 w-4 mr-1" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-template-form">
              <DialogHeader>
                <DialogTitle>{editingTemplate ? "Edit Email Template" : "Add Email Template"}</DialogTitle>
                <DialogDescription>
                  {editingTemplate ? "Update email template details" : "Create a new email template"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="content">HTML Content</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="general" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Welcome Email"
                          required
                          data-testid="input-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                          placeholder="welcome-email"
                          required
                          data-testid="input-slug"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject Line</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Welcome to DIDTron, {{ firstName }}!"
                        required
                        data-testid="input-subject"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use {"{{ variableName }}"} for dynamic content
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(v) => setFormData({ ...formData, category: v })}
                        >
                          <SelectTrigger data-testid="select-category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="onboarding">Onboarding</SelectItem>
                            <SelectItem value="billing">Billing</SelectItem>
                            <SelectItem value="security">Security</SelectItem>
                            <SelectItem value="compliance">Compliance</SelectItem>
                            <SelectItem value="rewards">Rewards</SelectItem>
                            <SelectItem value="reports">Reports</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end gap-2 pb-2">
                        <Switch
                          id="isActive"
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                          data-testid="switch-active"
                        />
                        <Label htmlFor="isActive">Active</Label>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="content" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="htmlContent">HTML Content</Label>
                      <Textarea
                        id="htmlContent"
                        value={formData.htmlContent}
                        onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                        placeholder="<html>...</html>"
                        className="font-mono text-sm min-h-[400px]"
                        data-testid="input-html-content"
                      />
                      <p className="text-xs text-muted-foreground">
                        Available variables: firstName, lastName, email, loginUrl, portalUrl, amount, invoiceNumber, etc.
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview">
                    <div className="border rounded-lg overflow-hidden bg-white">
                      <div className="p-2 bg-muted border-b text-sm">
                        <strong>Subject:</strong> {formData.subject || "No subject"}
                      </div>
                      <div 
                        className="p-4 min-h-[400px]"
                        dangerouslySetInnerHTML={{ __html: formData.htmlContent || "<p>No content</p>" }}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-save-template"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : null}
                    {editingTemplate ? "Update" : "Create"}
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
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading email templates...
            </div>
          ) : !(templates ?? []).length ? (
            <div className="p-8 text-center text-muted-foreground">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No email templates found.</p>
              <p className="text-sm mt-1">Click "Seed Default Templates" to load pre-built onboarding templates.</p>
            </div>
          ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((template) => (
                  <TableRow key={template.id} data-testid={`row-template-${template.id}`}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <Badge variant="outline" className="font-mono text-xs mt-1">{template.slug}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[250px] truncate">{template.subject}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={categoryColors[template.category || "general"] || categoryColors.general}
                      >
                        {template.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={template.isActive 
                          ? "bg-green-500/10 text-green-500 border-green-500/20" 
                          : "bg-muted text-muted-foreground"
                        }
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handlePreview(template)}
                          data-testid={`button-preview-template-${template.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSendTest(template)}
                          data-testid={`button-test-template-${template.id}`}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(template)}
                          data-testid={`button-edit-template-${template.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(template.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-template-${template.id}`}
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

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
            <DialogDescription>
              Subject: {previewTemplate?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden bg-white">
            <div 
              className="p-4 min-h-[400px]"
              dangerouslySetInnerHTML={{ __html: previewTemplate?.htmlContent || "<p>No content</p>" }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={testEmailOpen} onOpenChange={setTestEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test email for "{previewTemplate?.name}" with sample data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Email Address</Label>
              <Input
                id="test-email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your@email.com"
                data-testid="input-test-email"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Test emails will use sample data for all template variables.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestEmailOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => previewTemplate && sendTestMutation.mutate({ id: previewTemplate.id, email: testEmail })}
              disabled={!testEmail || sendTestMutation.isPending}
              data-testid="button-send-test"
            >
              {sendTestMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-1" />
              )}
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
