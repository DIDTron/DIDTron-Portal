import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest, STALE_TIME, keepPreviousData } from "@/lib/queryClient";
import { 
  Search, CheckCircle2, XCircle, Clock, FileText, User, 
  AlertTriangle, Loader2, Eye, ThumbsUp, ThumbsDown, Shield
} from "lucide-react";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import type { CustomerKyc, Customer } from "@shared/schema";

function getStatusBadge(status: string | null) {
  switch (status) {
    case "approved":
      return <Badge variant="default"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
    case "pending":
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
    case "rejected":
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    case "expired":
      return <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />Expired</Badge>;
    default:
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Not Started</Badge>;
  }
}

export default function KycPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKyc, setSelectedKyc] = useState<CustomerKyc | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: kycRequests = [], isLoading } = useQuery<CustomerKyc[]>({
    queryKey: ["/api/kyc"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
    staleTime: STALE_TIME.LIST,
    placeholderData: keepPreviousData,
  });

  const approveKyc = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/kyc/${id}/approve`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kyc"] });
      setShowReviewDialog(false);
      setSelectedKyc(null);
      toast({ title: "KYC Approved", description: "Customer verification has been approved" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to approve KYC", variant: "destructive" });
    },
  });

  const rejectKyc = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/kyc/${id}/reject`, { rejectionReason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kyc"] });
      setShowReviewDialog(false);
      setSelectedKyc(null);
      setRejectionReason("");
      toast({ title: "KYC Rejected", description: "Customer verification has been rejected" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to reject KYC", variant: "destructive" });
    },
  });

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.companyName || "Unknown Customer";
  };

  const filteredRequests = kycRequests.filter(kyc => {
    const customerName = getCustomerName(kyc.customerId);
    const matchesSearch = !searchTerm || 
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kyc.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && kyc.status === activeTab;
  });

  const pendingCount = kycRequests.filter(k => k.status === "pending").length;
  const approvedCount = kycRequests.filter(k => k.status === "approved").length;
  const rejectedCount = kycRequests.filter(k => k.status === "rejected").length;

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(filteredRequests);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">KYC Verification</h1>
          <p className="text-muted-foreground">Review and manage customer identity verification requests</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
              data-testid="input-search-kyc"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-yellow-500/10">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-red-500/10">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rejectedCount}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{kycRequests.length}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" data-testid="tab-pending">
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">
            Approved ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected">
            Rejected ({rejectedCount})
          </TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all">
            All
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No KYC requests found</p>
                <p className="text-sm">KYC requests will appear here when customers submit verification</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((kyc) => (
                      <TableRow key={kyc.id} data-testid={`row-kyc-${kyc.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{getCustomerName(kyc.customerId)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{kyc.documentType || "N/A"}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(kyc.status)}</TableCell>
                        <TableCell className="text-sm">
                          {kyc.createdAt ? new Date(kyc.createdAt).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {kyc.verifiedAt ? new Date(kyc.verifiedAt).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setSelectedKyc(kyc);
                                setShowReviewDialog(true);
                              }}
                              data-testid={`button-review-kyc-${kyc.id}`}
                              aria-label="Review"
                              title="Review"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {kyc.status === "pending" && (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => approveKyc.mutate(kyc.id)}
                                  disabled={approveKyc.isPending}
                                  data-testid={`button-approve-kyc-${kyc.id}`}
                                  aria-label="Approve"
                                  title="Approve"
                                >
                                  <ThumbsUp className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedKyc(kyc);
                                    setShowReviewDialog(true);
                                  }}
                                  data-testid={`button-reject-kyc-${kyc.id}`}
                                  aria-label="Reject"
                                  title="Reject"
                                >
                                  <ThumbsDown className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
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
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review KYC Request</DialogTitle>
            <DialogDescription>
              Review customer verification documents and make a decision
            </DialogDescription>
          </DialogHeader>
          {selectedKyc && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <p className="font-medium">{getCustomerName(selectedKyc.customerId)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedKyc.status)}</div>
                </div>
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <p>{selectedKyc.documentType || "Not specified"}</p>
                </div>
                <div className="space-y-2">
                  <Label>Submitted</Label>
                  <p>{selectedKyc.createdAt ? new Date(selectedKyc.createdAt).toLocaleString() : "-"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>ID Document</Label>
                {selectedKyc.documentUrl ? (
                  <a 
                    href={selectedKyc.documentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    View Document
                  </a>
                ) : (
                  <p className="text-muted-foreground">No document uploaded</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Address Document</Label>
                {selectedKyc.addressDocumentUrl ? (
                  <a 
                    href={selectedKyc.addressDocumentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    View Document
                  </a>
                ) : (
                  <p className="text-muted-foreground">No document uploaded</p>
                )}
              </div>

              {selectedKyc.status === "rejected" && selectedKyc.rejectionReason && (
                <div className="space-y-2">
                  <Label>Rejection Reason</Label>
                  <p className="text-destructive">{selectedKyc.rejectionReason}</p>
                </div>
              )}

              {selectedKyc.status === "pending" && (
                <div className="space-y-2">
                  <Label>Rejection Reason (if rejecting)</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    data-testid="textarea-rejection-reason"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Close
            </Button>
            {selectedKyc?.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => selectedKyc && rejectKyc.mutate(selectedKyc.id)}
                  disabled={rejectKyc.isPending || !rejectionReason}
                  data-testid="button-confirm-reject"
                >
                  {rejectKyc.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Reject
                </Button>
                <Button
                  onClick={() => selectedKyc && approveKyc.mutate(selectedKyc.id)}
                  disabled={approveKyc.isPending}
                  data-testid="button-confirm-approve"
                >
                  {approveKyc.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
