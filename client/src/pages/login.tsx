import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { login } from "@/lib/auth";
import { FloatingParticles } from "@/components/ui/floating-particles";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      toast({
        title: "Welcome back!",
        description: `Signed in as ${result.user.email}`,
      });
      // Redirect super admins to admin portal, others to customer dashboard
      if (result.user.role === "super_admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <FloatingParticles />
      
      <header className="border-b bg-background relative z-20">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-6">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xl font-bold">
              <span className="text-primary">DID</span>
              <span className="text-foreground">Tron</span>
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative z-20">
        <div className="w-full max-w-md p-8 rounded-lg border border-border/30 bg-transparent backdrop-blur-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold" data-testid="text-login-title">Welcome Back</h1>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your DIDTron account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-card border-border"
                data-testid="input-email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-primary hover:underline" data-testid="link-forgot-password">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-card border-border"
                data-testid="input-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login">
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/register" className="text-primary hover:underline" data-testid="link-register">
              Sign up
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
