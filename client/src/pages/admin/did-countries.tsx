import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Globe, Pencil, Trash2 } from "lucide-react";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import type { DidCountry } from "@shared/schema";

export default function DIDCountriesPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<DidCountry | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    isoCode: "",
    dialCode: "",
    kycRequired: false,
  });

  const { data: countries = [], isLoading } = useQuery<DidCountry[]>({
    queryKey: ["/api/did-countries"],
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
  } = useDataTablePagination(countries);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/did-countries", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/did-countries"] });
      toast({ title: "DID country added successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add DID country", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await apiRequest("PATCH", `/api/did-countries/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/did-countries"] });
      toast({ title: "DID country updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update DID country", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/did-countries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/did-countries"] });
      toast({ title: "DID country removed successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to remove DID country", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", isoCode: "", dialCode: "", kycRequired: false });
    setEditingCountry(null);
    setIsOpen(false);
  };

  const handleEdit = (country: DidCountry) => {
    setEditingCountry(country);
    setFormData({
      name: country.name,
      isoCode: country.isoCode,
      dialCode: country.dialCode,
      kycRequired: country.kycRequired || false,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCountry) {
      updateMutation.mutate({ id: editingCountry.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-did-countries-title">DID Countries</h1>
          <p className="text-muted-foreground">Manage available DID countries</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingCountry(null); setFormData({ name: "", isoCode: "", dialCode: "", kycRequired: false }); }} data-testid="button-add-country">
              <Plus className="h-4 w-4 mr-2" />
              Add Country
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingCountry ? "Edit DID Country" : "Add DID Country"}</DialogTitle>
                <DialogDescription>{editingCountry ? "Update country settings" : "Configure a new country for DIDs"}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Country Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="United States"
                      required
                      data-testid="input-country-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isoCode">ISO Code</Label>
                    <Input
                      id="isoCode"
                      value={formData.isoCode}
                      onChange={(e) => setFormData({ ...formData, isoCode: e.target.value })}
                      placeholder="US"
                      required
                      data-testid="input-country-code"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dialCode">Dial Code</Label>
                  <Input
                    id="dialCode"
                    value={formData.dialCode}
                    onChange={(e) => setFormData({ ...formData, dialCode: e.target.value })}
                    placeholder="+1"
                    required
                    data-testid="input-country-dialcode"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="kycRequired">Requires KYC Verification</Label>
                  <Switch
                    id="kycRequired"
                    checked={formData.kycRequired}
                    onCheckedChange={(checked) => setFormData({ ...formData, kycRequired: checked })}
                    data-testid="switch-requires-kyc"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel-country">Cancel</Button>
                <Button type="submit" disabled={isPending} data-testid="button-save-country">
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : countries.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>ISO Code</TableHead>
                    <TableHead>Dial Code</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((country) => (
                    <TableRow key={country.id} data-testid={`row-country-${country.id}`}>
                      <TableCell className="font-medium">{country.name}</TableCell>
                      <TableCell><code className="text-xs">{country.isoCode}</code></TableCell>
                      <TableCell>{country.dialCode}</TableCell>
                      <TableCell>
                        {country.kycRequired ? (
                          <Badge variant="outline">Required</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={country.isActive ? "default" : "secondary"}>
                          {country.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(country)} aria-label="Edit" data-testid={`button-edit-country-${country.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(country.id)} aria-label="Delete" data-testid={`button-delete-country-${country.id}`}>
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
          ) : (
            <div className="p-8 text-center">
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">No DID countries configured</h3>
              <p className="text-sm text-muted-foreground mb-4">Add countries where DIDs are available</p>
              <Button onClick={() => setIsOpen(true)} data-testid="button-add-first-country">
                <Plus className="h-4 w-4 mr-2" />
                Add Country
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
