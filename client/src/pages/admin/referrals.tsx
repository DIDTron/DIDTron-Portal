import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Users2, Pencil, Trash2 } from "lucide-react";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import type { Referral, Customer } from "@shared/schema";

type ReferralFormData = {
  referrerId: string;
  referredId: string;
  status: string;
  commission: string;
};

export default function ReferralsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null);
  const [formData, setFormData] = useState<ReferralFormData>({
    referrerId: "",
    referredId: "",
    status: "pending",
    commission: "0",
  });

  const { data: referrals, isLoading } = useQuery<Referral[]>({
    queryKey: ["/api/referrals"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const createMutation = useMutation({
    mutationFn: async (data: ReferralFormData) => {
      const res = await apiRequest("POST", "/api/referrals", {
        ...data,
        referredId: data.referredId || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
      toast({ title: "Referral created successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to create referral", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ReferralFormData }) => {
      const res = await apiRequest("PATCH", `/api/referrals/${id}`, {
        ...data,
        referredId: data.referredId || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
      toast({ title: "Referral updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update referral", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/referrals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referrals"] });
      toast({ title: "Referral deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to delete referral", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      referrerId: "",
      referredId: "",
      status: "pending",
      commission: "0",
    });
    setEditingReferral(null);
    setIsOpen(false);
  };

  const handleEdit = (referral: Referral) => {
    setEditingReferral(referral);
    setFormData({
      referrerId: referral.referrerId,
      referredId: referral.referredId || "",
      status: referral.status || "pending",
      commission: referral.commission || "0",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReferral) {
      updateMutation.mutate({ id: editingReferral.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getCustomerName = (customerId: string | null) => {
    if (!customerId) return "-";
    return customers?.find(c => c.id === customerId)?.companyName || "-";
  };

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      converted: "bg-green-500/10 text-green-500 border-green-500/20",
      paid: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      expired: "bg-muted text-muted-foreground",
    };
    return variants[status || "pending"] || variants.pending;
  };

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(referrals ?? []);

  return (
    <div className="space-y-4" data-testid="referrals-page">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users2 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold" data-testid="text-page-title">Referrals</h2>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-referral">
              <Plus className="h-4 w-4 mr-1" />
              Add Referral
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" data-testid="dialog-referral-form">
            <DialogHeader>
              <DialogTitle>{editingReferral ? "Edit Referral" : "Add Referral"}</DialogTitle>
              <DialogDescription>
                {editingReferral ? "Update referral details" : "Create a new referral record"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="referrerId">Referrer (Customer)</Label>
                  <Select
                    value={formData.referrerId}
                    onValueChange={(v) => setFormData({ ...formData, referrerId: v })}
                  >
                    <SelectTrigger data-testid="select-referrer">
                      <SelectValue placeholder="Select referrer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((cust) => (
                        <SelectItem key={cust.id} value={cust.id}>{cust.companyName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referredId">Referred Customer (optional)</Label>
                  <Select
                    value={formData.referredId}
                    onValueChange={(v) => setFormData({ ...formData, referredId: v })}
                  >
                    <SelectTrigger data-testid="select-referred">
                      <SelectValue placeholder="Select referred customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.filter(c => c.id !== formData.referrerId).map((cust) => (
                        <SelectItem key={cust.id} value={cust.id}>{cust.companyName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commission">Commission ($)</Label>
                    <Input
                      id="commission"
                      type="number"
                      step="0.01"
                      value={formData.commission}
                      onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                      placeholder="0.00"
                      data-testid="input-commission"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-referral"
                >
                  {editingReferral ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading referrals...</div>
          ) : !referrals?.length ? (
            <div className="p-8 text-center text-muted-foreground">
              No referrals found. Create your first referral record.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referral Code</TableHead>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Referred</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((referral) => (
                    <TableRow key={referral.id} data-testid={`row-referral-${referral.id}`}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">{referral.referralCode}</Badge>
                      </TableCell>
                      <TableCell>{getCustomerName(referral.referrerId)}</TableCell>
                      <TableCell>{getCustomerName(referral.referredId)}</TableCell>
                      <TableCell>${referral.commission}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadge(referral.status)}>
                          {referral.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(referral)}
                            data-testid={`button-edit-referral-${referral.id}`}
                            aria-label="Edit referral"
                            title="Edit referral"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate(referral.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-referral-${referral.id}`}
                            aria-label="Delete referral"
                            title="Delete referral"
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
    </div>
  );
}
