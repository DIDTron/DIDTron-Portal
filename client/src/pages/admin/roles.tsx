import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, Plus, Edit, Trash2, Users, Lock, 
  Check, X
} from "lucide-react";
import { DataTableFooter, useDataTablePagination } from "@/components/ui/data-table-footer";

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  isSystem: boolean;
}

const PERMISSION_GROUPS = {
  customers: ["customers.view", "customers.create", "customers.edit", "customers.delete"],
  billing: ["billing.view", "billing.manage", "payments.process", "refunds.issue"],
  routes: ["routes.view", "routes.create", "routes.edit", "routes.delete"],
  dids: ["dids.view", "dids.provision", "dids.manage"],
  users: ["users.view", "users.create", "users.edit", "users.delete"],
  settings: ["settings.view", "settings.edit"],
};

export default function RolesPage() {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const roles: Role[] = [
    {
      id: "1",
      name: "Super Admin",
      description: "Full access to all platform features",
      userCount: 2,
      permissions: Object.values(PERMISSION_GROUPS).flat(),
      isSystem: true,
    },
    {
      id: "2",
      name: "Account Manager",
      description: "Manage customers and billing",
      userCount: 5,
      permissions: [...PERMISSION_GROUPS.customers, ...PERMISSION_GROUPS.billing],
      isSystem: false,
    },
    {
      id: "3",
      name: "Network Admin",
      description: "Manage routes and carriers",
      userCount: 3,
      permissions: [...PERMISSION_GROUPS.routes, ...PERMISSION_GROUPS.dids],
      isSystem: false,
    },
    {
      id: "4",
      name: "Support Agent",
      description: "View-only access for support",
      userCount: 8,
      permissions: ["customers.view", "billing.view", "routes.view", "dids.view"],
      isSystem: false,
    },
  ];

  const togglePermission = (permission: string) => {
    if (newRole.permissions.includes(permission)) {
      setNewRole({ ...newRole, permissions: newRole.permissions.filter(p => p !== permission) });
    } else {
      setNewRole({ ...newRole, permissions: [...newRole.permissions, permission] });
    }
  };

  const handleCreateRole = () => {
    toast({ title: "Role Created", description: `Role "${newRole.name}" has been created` });
    setShowCreateDialog(false);
    setNewRole({ name: "", description: "", permissions: [] });
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
    setShowEditDialog(true);
  };

  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    onPageChange,
    onPageSizeChange,
  } = useDataTablePagination(roles);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage access control for platform users</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-role">
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Role</DialogTitle>
              <DialogDescription>
                Define a new role with specific permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role Name</Label>
                  <Input
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="Account Manager"
                    data-testid="input-role-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    placeholder="Manage customers and billing"
                    data-testid="input-role-description"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <Tabs defaultValue="customers" className="w-full">
                  <TabsList className="grid grid-cols-6">
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                    <TabsTrigger value="routes">Routes</TabsTrigger>
                    <TabsTrigger value="dids">DIDs</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                  {Object.entries(PERMISSION_GROUPS).map(([group, permissions]) => (
                    <TabsContent key={group} value={group} className="mt-4">
                      <div className="grid grid-cols-2 gap-3">
                        {permissions.map((permission) => (
                          <div key={permission} className="flex items-center gap-2">
                            <Checkbox
                              id={permission}
                              checked={newRole.permissions.includes(permission)}
                              onCheckedChange={() => togglePermission(permission)}
                            />
                            <label htmlFor={permission} className="text-sm">
                              {permission.split(".")[1].charAt(0).toUpperCase() + permission.split(".")[1].slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRole} data-testid="button-save-role">
                Create Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roles.length}</p>
                <p className="text-sm text-muted-foreground">Total Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roles.reduce((acc, r) => acc + r.userCount, 0)}</p>
                <p className="text-sm text-muted-foreground">Users with Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-yellow-500/10">
                <Lock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roles.filter(r => r.isSystem).length}</p>
                <p className="text-sm text-muted-foreground">System Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-md bg-green-500/10">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Object.values(PERMISSION_GROUPS).flat().length}</p>
                <p className="text-sm text-muted-foreground">Permissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Roles</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.map((role) => (
                <TableRow key={role.id} data-testid={`row-role-${role.id}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{role.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{role.userCount} users</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role.permissions.length} permissions</Badge>
                  </TableCell>
                  <TableCell>
                    {role.isSystem ? (
                      <Badge variant="default">System</Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditRole(role)}
                        disabled={role.isSystem}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        disabled={role.isSystem}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
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
        </CardContent>
      </Card>
    </div>
  );
}
