import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, FileText, Edit, Eye, Copy, Trash2 } from "lucide-react";

const mockTemplates = [
  {
    id: "1",
    name: "Standard Invoice",
    type: "invoice",
    formats: ["pdf", "xlsx", "csv"],
    isDefault: true,
    lastModified: "2026-01-01",
  },
  {
    id: "2",
    name: "Statement of Account",
    type: "soa",
    formats: ["pdf", "xlsx"],
    isDefault: true,
    lastModified: "2026-01-01",
  },
  {
    id: "3",
    name: "Credit Note",
    type: "credit_note",
    formats: ["pdf"],
    isDefault: true,
    lastModified: "2026-01-01",
  },
  {
    id: "4",
    name: "Netting Request",
    type: "netting",
    formats: ["pdf"],
    isDefault: true,
    lastModified: "2026-01-01",
  },
];

const templateVariables = [
  { name: "{{company_name}}", description: "Your company name" },
  { name: "{{customer_name}}", description: "Customer name" },
  { name: "{{customer_address}}", description: "Customer billing address" },
  { name: "{{invoice_number}}", description: "Invoice number" },
  { name: "{{invoice_date}}", description: "Issue date" },
  { name: "{{due_date}}", description: "Payment due date" },
  { name: "{{period_start}}", description: "Billing period start" },
  { name: "{{period_end}}", description: "Billing period end" },
  { name: "{{subtotal}}", description: "Amount before tax" },
  { name: "{{tax}}", description: "Tax amount" },
  { name: "{{total}}", description: "Total amount due" },
  { name: "{{currency}}", description: "Currency code" },
  { name: "{{line_items}}", description: "Invoice line items (loop)" },
  { name: "{{bank_details}}", description: "Bank account details" },
];

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState("templates");

  const getTypeBadge = (type: string) => {
    const colors: Record<string, "default" | "secondary" | "outline"> = {
      invoice: "default",
      soa: "secondary",
      credit_note: "outline",
      netting: "outline",
    };
    return <Badge variant={colors[type] || "outline"} className="capitalize">{type.replace("_", " ")}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Document Templates</h1>
          <p className="text-muted-foreground">Manage templates for invoices, SOA, credit notes, and netting requests</p>
        </div>
        <Button data-testid="button-create">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates" data-testid="tab-templates">Templates</TabsTrigger>
          <TabsTrigger value="variables" data-testid="tab-variables">Variables Reference</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {["invoice", "soa", "credit_note", "netting"].map((type) => (
              <Card key={type} className="hover-elevate cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base capitalize">{type.replace("_", " ")}</CardTitle>
                  <CardDescription>
                    {mockTemplates.filter(t => t.type === type).length} template(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      Click to manage
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Templates</CardTitle>
              <CardDescription>Manage document templates for PDF, XLSX, and CSV generation</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Formats</TableHead>
                    <TableHead>Default</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTemplates.map((template) => (
                    <TableRow key={template.id} data-testid={`row-template-${template.id}`}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>{getTypeBadge(template.type)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {template.formats.map((format) => (
                            <Badge key={format} variant="outline" className="uppercase text-xs">
                              {format}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {template.isDefault && <Badge variant="secondary">Default</Badge>}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{template.lastModified}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" data-testid={`button-preview-${template.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" data-testid={`button-edit-${template.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" data-testid={`button-duplicate-${template.id}`}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" data-testid={`button-delete-${template.id}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Variables</CardTitle>
              <CardDescription>Available variables for use in document templates (Handlebars syntax)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variable</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templateVariables.map((variable, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">{variable.name}</code>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{variable.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
