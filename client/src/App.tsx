import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import AdminLayout from "@/pages/admin/index";
import PortalLayout from "@/pages/portal/index";
import Docs from "@/pages/docs";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/docs" component={Docs} />
      <Route path="/docs/:category" component={Docs} />
      <Route path="/docs/:category/:article" component={Docs} />
      <Route path="/admin" component={AdminLayout} />
      <Route path="/admin/:section" component={AdminLayout} />
      <Route path="/admin/:section/:subsection" component={AdminLayout} />
      <Route path="/portal" component={PortalLayout} />
      <Route path="/portal/:section" component={PortalLayout} />
      <Route path="/portal/:section/:subsection" component={PortalLayout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="didtron-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
