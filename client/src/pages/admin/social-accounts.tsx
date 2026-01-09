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
import { Plus, Share2, Pencil, Trash2 } from "lucide-react";
import { SiX, SiFacebook, SiLinkedin, SiInstagram } from "react-icons/si";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";
import type { SocialAccount } from "@shared/schema";

type AccountFormData = {
  platform: string;
  accountName: string;
  accountId: string;
  accessToken: string;
  isActive: boolean;
};

const PLATFORMS = [
  { value: "twitter", label: "Twitter/X", icon: SiX },
  { value: "facebook", label: "Facebook", icon: SiFacebook },
  { value: "linkedin", label: "LinkedIn", icon: SiLinkedin },
  { value: "instagram", label: "Instagram", icon: SiInstagram },
];

export default function SocialAccountsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null);
  const [formData, setFormData] = useState<AccountFormData>({
    platform: "twitter",
    accountName: "",
    accountId: "",
    accessToken: "",
    isActive: true,
  });

  const { data: accounts, isLoading } = useQuery<SocialAccount[]>({
    queryKey: ["/api/social-accounts"],
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(accounts ?? []);

  const createMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      const res = await apiRequest("POST", "/api/social-accounts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-accounts"] });
      toast({ title: "Social account connected successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to connect account", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AccountFormData }) => {
      const res = await apiRequest("PATCH", `/api/social-accounts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-accounts"] });
      toast({ title: "Account updated successfully" });
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update account", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/social-accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-accounts"] });
      toast({ title: "Account disconnected successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to disconnect account", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      platform: "twitter",
      accountName: "",
      accountId: "",
      accessToken: "",
      isActive: true,
    });
    setEditingAccount(null);
    setIsOpen(false);
  };

  const handleEdit = (account: SocialAccount) => {
    setEditingAccount(account);
    setFormData({
      platform: account.platform,
      accountName: account.accountName || "",
      accountId: account.accountId || "",
      accessToken: account.accessToken || "",
      isActive: account.isActive ?? true,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformInfo = PLATFORMS.find(p => p.value === platform);
    if (!platformInfo) return <Share2 className="h-4 w-4" />;
    const Icon = platformInfo.icon;
    return <Icon className="h-4 w-4" />;
  };

  const getPlatformLabel = (platform: string) => {
    return PLATFORMS.find(p => p.value === platform)?.label || platform;
  };

  return (
    <div className="space-y-4" data-testid="social-accounts-page">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold" data-testid="text-page-title">Social Accounts</h2>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-account">
              <Plus className="h-4 w-4 mr-1" />
              Connect Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" data-testid="dialog-account-form">
            <DialogHeader>
              <DialogTitle>{editingAccount ? "Edit Account" : "Connect Social Account"}</DialogTitle>
              <DialogDescription>
                {editingAccount ? "Update account details" : "Connect a social media account for posting"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger data-testid="select-platform">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex items-center gap-2">
                          <p.icon className="h-4 w-4" />
                          {p.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="@didtron"
                  data-testid="input-account-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountId">Account ID (optional)</Label>
                <Input
                  id="accountId"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  placeholder="Platform-specific account ID"
                  data-testid="input-account-id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token (Ayrshare)</Label>
                <Input
                  id="accessToken"
                  type="password"
                  value={formData.accessToken}
                  onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                  placeholder="Paste access token from Ayrshare"
                  data-testid="input-access-token"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  data-testid="switch-active"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {editingAccount ? "Update" : "Connect"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading accounts...</div>
          ) : !accounts?.length ? (
            <div className="p-8 text-center text-muted-foreground">
              No social accounts connected. Connect your first account to start posting.
            </div>
          ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((account) => (
                  <TableRow key={account.id} data-testid={`row-account-${account.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(account.platform)}
                        <span>{getPlatformLabel(account.platform)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{account.accountName || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={account.isActive ? "default" : "secondary"}>
                        {account.isActive ? "Connected" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(account)}
                          data-testid={`button-edit-${account.id}`}
                          aria-label="Edit account"
                          title="Edit account"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(account.id)}
                          data-testid={`button-delete-${account.id}`}
                          aria-label="Delete account"
                          title="Delete account"
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
