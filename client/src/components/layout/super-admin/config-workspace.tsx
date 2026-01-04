import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfigWorkspaceProps {
  children: {
    general: React.ReactNode;
    advanced?: React.ReactNode;
    assignment?: React.ReactNode;
  };
  defaultTab?: "general" | "advanced" | "assignment";
  showAdvanced?: boolean;
  showAssignment?: boolean;
  onTabChange?: (tab: string) => void;
}

export function ConfigWorkspace({
  children,
  defaultTab = "general",
  showAdvanced = true,
  showAssignment = true,
  onTabChange,
}: ConfigWorkspaceProps) {
  return (
    <Tabs defaultValue={defaultTab} className="w-full" onValueChange={onTabChange}>
      <div className="flex items-center justify-between border-b pb-0">
        <TabsList className="h-10 bg-transparent p-0 gap-4">
          <TabsTrigger 
            value="general" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3"
            data-testid="tab-general"
          >
            GENERAL
          </TabsTrigger>
          {showAdvanced && (
            <TabsTrigger 
              value="advanced" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3"
              data-testid="tab-advanced"
            >
              ADVANCED
            </TabsTrigger>
          )}
          {showAssignment && (
            <TabsTrigger 
              value="assignment" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3"
              data-testid="tab-assignment"
            >
              ASSIGNMENT
            </TabsTrigger>
          )}
        </TabsList>

        <Button variant="ghost" size="icon" data-testid="button-config-menu">
          <List className="h-4 w-4" />
        </Button>
      </div>

      <TabsContent value="general" className="mt-6">
        {children.general}
      </TabsContent>

      {showAdvanced && (
        <TabsContent value="advanced" className="mt-6">
          {children.advanced || (
            <div className="text-muted-foreground text-center py-8">
              No advanced settings available
            </div>
          )}
        </TabsContent>
      )}

      {showAssignment && (
        <TabsContent value="assignment" className="mt-6">
          {children.assignment || <AssignmentTab />}
        </TabsContent>
      )}
    </Tabs>
  );
}

function AssignmentTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Visibility Settings</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Control which customers can see and use this configuration item.
        </p>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between p-4 border rounded-md">
          <div>
            <p className="font-medium">Assignment Type</p>
            <p className="text-sm text-muted-foreground">Who can access this item</p>
          </div>
          <select 
            className="border rounded-md px-3 py-2 bg-background"
            data-testid="select-assignment-type"
          >
            <option value="all">All Customers</option>
            <option value="categories">Specific Categories</option>
            <option value="groups">Specific Groups</option>
            <option value="customers">Specific Customers</option>
          </select>
        </div>

        <div className="p-4 border rounded-md bg-muted/30">
          <p className="text-sm text-muted-foreground text-center">
            Select an assignment type to configure visibility rules
          </p>
        </div>
      </div>
    </div>
  );
}
