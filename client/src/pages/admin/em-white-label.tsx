import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import { 
  Plus, 
  Building2, 
  Pencil, 
  Trash2, 
  Globe,
  Key,
  Palette,
  ExternalLink,
  Search,
  Check,
  X
} from "lucide-react";

interface WhiteLabelBrand {
  id: string;
  customerName: string;
  domain: string;
  primaryColor: string;
  status: "active" | "pending" | "inactive";
  createdAt: string;
}

export default function EMWhiteLabelPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("brands");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBrand, setEditingBrand] = useState<WhiteLabelBrand | null>(null);

  const mockBrands: WhiteLabelBrand[] = [
    { id: "1", customerName: "Acme Corp", domain: "voip.acme.com", primaryColor: "#EF4444", status: "active", createdAt: "2024-01-15" },
    { id: "2", customerName: "TechStart Inc", domain: "calls.techstart.io", primaryColor: "#3B82F6", status: "active", createdAt: "2024-02-20" },
    { id: "3", customerName: "GlobalTel", domain: "portal.globaltel.net", primaryColor: "#10B981", status: "pending", createdAt: "2024-03-10" },
    { id: "4", customerName: "VoiceWave", domain: "app.voicewave.com", primaryColor: "#8B5CF6", status: "active", createdAt: "2024-03-25" },
    { id: "5", customerName: "CallPro Services", domain: "my.callpro.services", primaryColor: "#F59E0B", status: "inactive", createdAt: "2024-04-01" },
  ];

  const filteredBrands = useMemo(() => {
    return mockBrands.filter(brand =>
      brand.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.domain.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(filteredBrands);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default"><Check className="h-3 w-3 mr-1" />Active</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "inactive":
        return <Badge variant="outline"><X className="h-3 w-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 p-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">White-Label</h1>
          <p className="text-sm text-muted-foreground">Manage customer branding, domains, and login pages</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-brand">
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b px-6">
          <TabsList className="h-auto p-0 bg-transparent">
            <TabsTrigger value="brands" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary" data-testid="tab-brands">
              <Building2 className="h-4 w-4 mr-2" />
              Customer Brands
            </TabsTrigger>
            <TabsTrigger value="domains" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary" data-testid="tab-domains">
              <Globe className="h-4 w-4 mr-2" />
              Custom Domains
            </TabsTrigger>
            <TabsTrigger value="login" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary" data-testid="tab-login">
              <Key className="h-4 w-4 mr-2" />
              Login Pages
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="brands" className="flex-1 mt-0 overflow-auto">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-brands"
                />
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Brand Color</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((brand) => (
                    <TableRow key={brand.id} data-testid={`row-brand-${brand.id}`}>
                      <TableCell className="font-medium">{brand.customerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">{brand.domain}</code>
                          <Button size="icon" variant="ghost" className="h-6 w-6">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: brand.primaryColor }}
                          />
                          <span className="font-mono text-xs">{brand.primaryColor}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(brand.status)}</TableCell>
                      <TableCell className="text-muted-foreground">{brand.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" data-testid={`button-edit-${brand.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" data-testid={`button-delete-${brand.id}`}>
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
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="domains" className="flex-1 mt-0 overflow-auto">
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Domains</CardTitle>
                <CardDescription>Configure custom domains for white-label customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockBrands.slice(0, 3).map((brand) => (
                    <div key={brand.id} className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <p className="font-medium">{brand.domain}</p>
                        <p className="text-sm text-muted-foreground">{brand.customerName}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant="default">SSL Active</Badge>
                        </div>
                        <Button variant="outline" size="sm">Configure DNS</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="login" className="flex-1 mt-0 overflow-auto">
          <div className="p-6">
            <Card>
              <CardHeader>
                <CardTitle>Login Page Customization</CardTitle>
                <CardDescription>Customize login pages for each white-label customer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockBrands.filter(b => b.status === "active").map((brand) => (
                    <Card key={brand.id} className="hover-elevate cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div 
                            className="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: brand.primaryColor }}
                          >
                            {brand.customerName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{brand.customerName}</p>
                            <p className="text-xs text-muted-foreground">{brand.domain}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full">
                          <Palette className="h-4 w-4 mr-2" />
                          Edit Login Page
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add White-Label Brand</DialogTitle>
            <DialogDescription>Create a new white-label configuration for a customer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input id="customerName" placeholder="e.g., Acme Corporation" data-testid="input-customer-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Custom Domain</Label>
              <Input id="domain" placeholder="e.g., voip.acme.com" data-testid="input-domain" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Brand Color</Label>
              <div className="flex gap-2">
                <Input id="primaryColor" type="color" defaultValue="#3B82F6" className="w-12 h-9 p-1" />
                <Input defaultValue="#3B82F6" className="flex-1 font-mono" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button data-testid="button-create-brand">Create Brand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
