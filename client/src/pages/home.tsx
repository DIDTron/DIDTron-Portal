import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Phone, 
  Globe, 
  Server, 
  Shield, 
  Zap, 
  BarChart3,
  Users,
  Headphones,
  Bot,
  ArrowRight,
  Check
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-2">
            <Phone className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold" data-testid="text-logo">DIDTron</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#services" className="text-sm font-medium text-muted-foreground hover-elevate px-2 py-1 rounded-md" data-testid="link-services">Services</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover-elevate px-2 py-1 rounded-md" data-testid="link-pricing">Pricing</a>
            <a href="#portals" className="text-sm font-medium text-muted-foreground hover-elevate px-2 py-1 rounded-md" data-testid="link-portals">Portals</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" data-testid="button-login">Login</Button>
            </Link>
            <Link href="/register">
              <Button data-testid="button-get-started">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative min-h-[600px] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
          <div className="container mx-auto px-6 py-20 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge variant="secondary" className="text-sm" data-testid="badge-hero">
                  Pay-As-You-Go VoIP Platform
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight" data-testid="text-hero-title">
                  Enterprise VoIP
                  <span className="text-primary"> Wholesale Platform</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg" data-testid="text-hero-description">
                  White-label wholesale VoIP platform with AI-powered features. 
                  No subscriptions, no commitments. Pay only for what you use.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link href="/register">
                    <Button size="lg" data-testid="button-start-trial">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <a href="#pricing">
                    <Button variant="outline" size="lg" data-testid="button-view-pricing">
                      View Pricing
                    </Button>
                  </a>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-primary" />
                    <span>No Monthly Fees</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-primary" />
                    <span>99.99% Uptime</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-primary" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <Card className="p-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Live Platform Metrics</CardTitle>
                    <CardDescription>Real-time call statistics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-3xl font-bold text-primary" data-testid="metric-active-calls">2,847</p>
                        <p className="text-sm text-muted-foreground">Active Calls</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-3xl font-bold" data-testid="metric-asr">98.7%</p>
                        <p className="text-sm text-muted-foreground">ASR Rate</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-3xl font-bold" data-testid="metric-minutes">1.2M</p>
                        <p className="text-sm text-muted-foreground">Minutes Today</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="metric-quality">A+</p>
                        <p className="text-sm text-muted-foreground">Quality Score</p>
                      </div>
                    </div>
                    <div className="h-24 bg-muted/30 rounded-md flex items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" data-testid="text-services-title">Core Services</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Complete VoIP infrastructure with pay-as-you-go pricing. No hidden fees.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ServiceCard
                icon={Phone}
                title="Voice Termination"
                description="4 quality tiers from $0.005/min. Premium CLI routes with 99%+ ASR."
                price="From $0.005/min"
                testId="card-voice-termination"
              />
              <ServiceCard
                icon={Globe}
                title="DID Numbers"
                description="100+ countries with automated KYC. Instant provisioning available."
                price="From $1.50/mo"
                testId="card-did-numbers"
              />
              <ServiceCard
                icon={Server}
                title="Cloud PBX"
                description="Full-featured PBX with IVR, queues, ring groups, and voicemail."
                price="$3/extension"
                testId="card-cloud-pbx"
              />
              <ServiceCard
                icon={Bot}
                title="AI Voice Agent"
                description="Intelligent voice assistants with natural language understanding."
                price="$0.10/min"
                testId="card-ai-voice"
              />
              <ServiceCard
                icon={Zap}
                title="Class 4 Softswitch"
                description="Wholesale carrier interconnection with LCR and failover routing."
                price="$0.0005/min + $25 setup"
                testId="card-softswitch"
              />
              <ServiceCard
                icon={Shield}
                title="SIP Tester"
                description="14 test types including registration, codec, and quality testing."
                price="Included"
                testId="card-sip-tester"
              />
            </div>
          </div>
        </section>

        <section id="portals" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" data-testid="text-portals-title">Multiple Portals</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                White-label ready with separate interfaces for customers, carriers, and administrators.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <PortalCard
                icon={Users}
                title="Customer Portal"
                description="Self-service for SIP trunks, DIDs, and PBX management."
                testId="card-customer-portal"
              />
              <PortalCard
                icon={Server}
                title="Carrier Portal"
                description="Route management, rate cards, and interconnection tools."
                testId="card-carrier-portal"
              />
              <PortalCard
                icon={Shield}
                title="Admin Portal"
                description="Full platform control with monitoring and configuration."
                testId="card-admin-portal"
              />
              <PortalCard
                icon={Headphones}
                title="Support Portal"
                description="Ticket management and customer communication."
                testId="card-support-portal"
              />
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" data-testid="text-pricing-title">Simple Pay-As-You-Go Pricing</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                No subscriptions. No commitments. Pay only for what you use.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <PricingCard
                tier="Starter"
                description="For small businesses and startups"
                features={[
                  "Voice termination from $0.012/min",
                  "Up to 10 DIDs",
                  "Basic PBX features",
                  "Email support"
                ]}
                testId="card-pricing-starter"
              />
              <PricingCard
                tier="Professional"
                description="For growing companies"
                features={[
                  "Voice termination from $0.008/min",
                  "Unlimited DIDs",
                  "Full PBX features",
                  "AI Voice Agent access",
                  "Priority support"
                ]}
                highlighted
                testId="card-pricing-professional"
              />
              <PricingCard
                tier="Enterprise"
                description="For carriers and large organizations"
                features={[
                  "Custom termination rates",
                  "Class 4 Softswitch",
                  "White-label portals",
                  "Dedicated account manager",
                  "SLA guarantees"
                ]}
                testId="card-pricing-enterprise"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-5 w-5 text-primary" />
                <span className="font-bold">DIDTron</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered wholesale VoIP platform with pay-as-you-go pricing.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-voice-termination">Voice Termination</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-did-numbers">DID Numbers</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-cloud-pbx">Cloud PBX</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-ai-voice">AI Voice Agent</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-about">About Us</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-contact">Contact</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-careers">Careers</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-blog">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-docs">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-api">API Reference</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-status">Status Page</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-support">Contact Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p data-testid="text-copyright">2026 DIDTron Communications. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ 
  icon: Icon, 
  title, 
  description, 
  price,
  testId 
}: { 
  icon: typeof Phone; 
  title: string; 
  description: string; 
  price: string;
  testId: string;
}) {
  return (
    <Card className="hover-elevate" data-testid={testId}>
      <CardHeader>
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary">{price}</Badge>
      </CardContent>
    </Card>
  );
}

function PortalCard({ 
  icon: Icon, 
  title, 
  description,
  testId 
}: { 
  icon: typeof Phone; 
  title: string; 
  description: string;
  testId: string;
}) {
  return (
    <Card className="hover-elevate text-center" data-testid={testId}>
      <CardHeader>
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function PricingCard({ 
  tier, 
  description, 
  features, 
  highlighted = false,
  testId 
}: { 
  tier: string; 
  description: string; 
  features: string[]; 
  highlighted?: boolean;
  testId: string;
}) {
  return (
    <Card className={highlighted ? "border-primary border-2" : ""} data-testid={testId}>
      <CardHeader>
        {highlighted && <Badge className="w-fit mb-2">Most Popular</Badge>}
        <CardTitle>{tier}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button className="w-full" variant={highlighted ? "default" : "outline"} data-testid={`button-get-started-${tier.toLowerCase()}`}>
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}
