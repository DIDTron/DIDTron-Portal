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
  Check,
  Activity,
  TrendingUp,
  Clock,
  FileText,
  Lock,
  Wifi
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-6 md:px-8">
          <div className="flex items-center gap-2">
            <Phone className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold" data-testid="text-logo">DIDTron</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#services" className="text-sm font-medium text-muted-foreground hover-elevate px-2 py-1 rounded-md" data-testid="link-services">Platform</a>
            <a href="#portals" className="text-sm font-medium text-muted-foreground hover-elevate px-2 py-1 rounded-md" data-testid="link-portals">Portals</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover-elevate px-2 py-1 rounded-md" data-testid="link-pricing">Pricing</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover-elevate px-2 py-1 rounded-md" data-testid="link-api">API</a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover-elevate px-2 py-1 rounded-md" data-testid="link-docs">Docs</a>
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
        <section className="relative min-h-[700px] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
          <div className="container mx-auto px-6 md:px-8 py-20 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge variant="secondary" className="text-sm" data-testid="badge-hero">
                  Pure Pay-As-You-Go VoIP
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
                <p className="text-sm text-muted-foreground" data-testid="text-trust-line">
                  Trusted by 200+ carriers worldwide
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                <Card className="p-0 overflow-hidden">
                  <div className="bg-muted/50 border-b px-4 py-2 flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-destructive/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">DIDTron Dashboard</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      <Activity className="h-3 w-3 mr-1 text-green-500" />
                      LIVE
                    </Badge>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <MetricDisplay 
                        label="Active Calls" 
                        value="2,847" 
                        trend="+12.5%" 
                        positive 
                        testId="metric-hero-active-calls"
                      />
                      <MetricDisplay 
                        label="ASR Rate" 
                        value="98.7%" 
                        trend="+0.3%" 
                        positive 
                        testId="metric-hero-asr"
                      />
                      <MetricDisplay 
                        label="Minutes Today" 
                        value="1.2M" 
                        trend="+8.2%" 
                        positive 
                        testId="metric-hero-minutes"
                      />
                      <MetricDisplay 
                        label="Quality Score" 
                        value="A+" 
                        trend="Excellent" 
                        positive 
                        testId="metric-hero-quality"
                      />
                    </div>
                    <div className="h-32 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-lg flex items-end justify-between p-4">
                      {[35, 45, 30, 55, 70, 65, 80, 75, 85, 90, 78, 82].map((height, i) => (
                        <div 
                          key={i} 
                          className="w-4 bg-primary/60 rounded-t"
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="py-20 bg-muted/30">
          <div className="container mx-auto px-6 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" data-testid="text-services-title">Platform Capabilities</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Complete VoIP infrastructure with pay-as-you-go pricing. No hidden fees, no subscriptions.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ServiceCard
                icon={Phone}
                title="Wholesale Voice Termination"
                description="4 quality tiers from $0.005/min. Premium CLI routes with 99%+ ASR and global coverage."
                price="From $0.005/min"
                testId="card-voice-termination"
              />
              <ServiceCard
                icon={Globe}
                title="DID Number Management"
                description="100+ countries with automated KYC verification. Instant provisioning and porting available."
                price="From $1.50/mo"
                testId="card-did-numbers"
              />
              <ServiceCard
                icon={Server}
                title="Real-time Call Routing"
                description="Intelligent LCR with automatic failover. Load balancing across multiple carriers."
                price="Included"
                testId="card-call-routing"
              />
              <ServiceCard
                icon={Wifi}
                title="Carrier Interconnection"
                description="Direct peering with tier-1 carriers. SIP trunk provisioning and management."
                price="Custom rates"
                testId="card-carrier-interconnect"
              />
              <ServiceCard
                icon={BarChart3}
                title="Billing & Invoicing"
                description="Automated billing with real-time CDR processing. Multi-currency support."
                price="Included"
                testId="card-billing"
              />
              <ServiceCard
                icon={TrendingUp}
                title="Advanced Analytics"
                description="Real-time dashboards with call quality metrics, ASR/ACD tracking, and custom reports."
                price="Included"
                testId="card-analytics"
              />
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" data-testid="text-additional-services-title">Additional Services</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Extended capabilities for enterprise customers
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ServiceCard
                icon={Server}
                title="Cloud PBX"
                description="Full-featured PBX with IVR, queues, ring groups, call recording, and voicemail."
                price="$3/extension"
                testId="card-cloud-pbx"
              />
              <ServiceCard
                icon={Bot}
                title="AI Voice Agent"
                description="Intelligent voice assistants with natural language understanding and custom scripts."
                price="$0.10/min"
                testId="card-ai-voice"
              />
              <ServiceCard
                icon={Zap}
                title="Class 4 Softswitch"
                description="Wholesale carrier interconnection with advanced LCR, failover, and rate management."
                price="$0.0005/min + $25 setup"
                testId="card-softswitch"
              />
              <ServiceCard
                icon={Shield}
                title="SIP Tester"
                description="14 test types including registration, codec negotiation, and quality testing."
                price="Included"
                testId="card-sip-tester"
              />
              <ServiceCard
                icon={Bot}
                title="Social Media AI"
                description="AI-powered social media management with automated posting and engagement."
                price="Custom pricing"
                testId="card-social-ai"
              />
              <ServiceCard
                icon={FileText}
                title="White-Label CMS"
                description="Fully customizable portals with your branding, domain, and design."
                price="Included"
                testId="card-cms"
              />
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" data-testid="text-monitoring-title">Real-Time Monitoring</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Enterprise-grade monitoring and alerting for your VoIP infrastructure
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <MonitoringFeature 
                  icon={Activity}
                  title="Live Call Statistics"
                  description="Real-time visibility into active calls, ASR, ACD, and quality metrics across all routes."
                />
                <MonitoringFeature 
                  icon={Shield}
                  title="Fraud Detection Alerts"
                  description="AI-powered anomaly detection with instant notifications for suspicious patterns."
                />
                <MonitoringFeature 
                  icon={TrendingUp}
                  title="Quality Metrics"
                  description="MOS scores, jitter, packet loss, and latency monitoring with historical trends."
                />
                <MonitoringFeature 
                  icon={Clock}
                  title="Automated Actions"
                  description="Configure automatic route failover, carrier blocking, and threshold-based alerts."
                />
              </div>
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Network Status</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      All Systems Operational
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <StatusItem label="US-East POP" status="online" latency="12ms" />
                    <StatusItem label="EU-West POP" status="online" latency="28ms" />
                    <StatusItem label="APAC POP" status="online" latency="45ms" />
                    <StatusItem label="Primary DB" status="online" latency="2ms" />
                  </div>
                  <div className="h-px bg-border" />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">99.99%</p>
                      <p className="text-xs text-muted-foreground">Uptime SLA</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">24/7</p>
                      <p className="text-xs text-muted-foreground">Monitoring</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">&lt;5min</p>
                      <p className="text-xs text-muted-foreground">Response Time</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section id="portals" className="py-20">
          <div className="container mx-auto px-6 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" data-testid="text-portals-title">Portal Showcase</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                White-label ready with separate interfaces for customers, carriers, and administrators.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <PortalCard
                icon={Users}
                title="Customer Portal"
                description="Self-service for SIP trunks, DIDs, PBX management, and billing."
                color="primary"
                testId="card-customer-portal"
              />
              <PortalCard
                icon={Server}
                title="Carrier Portal"
                description="Route management, rate cards, interconnection, and traffic analytics."
                color="teal"
                testId="card-carrier-portal"
              />
              <PortalCard
                icon={Shield}
                title="Admin Portal"
                description="Full platform control with monitoring, configuration, and user management."
                color="indigo"
                testId="card-admin-portal"
              />
              <PortalCard
                icon={FileText}
                title="API Documentation"
                description="Complete REST API with SDKs, webhooks, and integration guides."
                color="primary"
                testId="card-docs-portal"
              />
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 bg-muted/30">
          <div className="container mx-auto px-6 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" data-testid="text-pricing-title">Simple Pay-As-You-Go Pricing</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                No subscriptions. No commitments. No hidden fees. Pay only for what you use.
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
                  "Standard support",
                  "Basic analytics"
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
                  "Priority support",
                  "Advanced analytics"
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
                  "SLA guarantees",
                  "Custom integrations"
                ]}
                ctaText="Contact Sales"
                testId="card-pricing-enterprise"
              />
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" data-testid="text-trust-title">Enterprise Trust</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Trusted by carriers and enterprises worldwide
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">SOC 2 Compliant</h3>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade security with regular third-party audits
                </p>
              </Card>
              <Card className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">99.99% Uptime</h3>
                <p className="text-sm text-muted-foreground">
                  Redundant infrastructure with guaranteed SLA
                </p>
              </Card>
              <Card className="p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">GDPR Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Full compliance with international data protection regulations
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-5 w-5 text-primary" />
                <span className="font-bold">DIDTron</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered wholesale VoIP platform with pure pay-as-you-go pricing.
              </p>
              <p className="text-sm text-muted-foreground">
                info@didtron.com
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-voice-termination">Voice Termination</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-did-numbers">DID Numbers</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-cloud-pbx">Cloud PBX</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-ai-voice">AI Voice Agent</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-softswitch">Class 4 Softswitch</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-docs">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-api">API Reference</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-status">Status Page</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-blog">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-support">Support</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-sales">Sales</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-partners">Partners</a></li>
                <li><a href="#" className="hover:text-foreground" data-testid="link-footer-careers">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p data-testid="text-copyright">2026 DIDTron Communications. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-foreground">Privacy Policy</a>
              <a href="#" className="hover:text-foreground">Terms of Service</a>
              <a href="#" className="hover:text-foreground">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MetricDisplay({ 
  label, 
  value, 
  trend, 
  positive,
  testId
}: { 
  label: string; 
  value: string; 
  trend: string; 
  positive?: boolean;
  testId: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-3xl font-bold" data-testid={testId}>{value}</p>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={`text-xs ${positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {trend}
        </span>
      </div>
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

function MonitoringFeature({
  icon: Icon,
  title,
  description
}: {
  icon: typeof Activity;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function StatusItem({
  label,
  status,
  latency
}: {
  label: string;
  status: 'online' | 'offline';
  latency: string;
}) {
  return (
    <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-xs text-muted-foreground">{latency}</span>
    </div>
  );
}

function PortalCard({ 
  icon: Icon, 
  title, 
  description,
  color,
  testId 
}: { 
  icon: typeof Phone; 
  title: string; 
  description: string;
  color: 'primary' | 'teal' | 'indigo';
  testId: string;
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    teal: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
  };
  
  return (
    <Card className="hover-elevate text-center" data-testid={testId}>
      <CardHeader>
        <div className={`h-12 w-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mx-auto mb-2`}>
          <Icon className="h-6 w-6" />
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
  ctaText = "Get Started",
  testId 
}: { 
  tier: string; 
  description: string; 
  features: string[]; 
  highlighted?: boolean;
  ctaText?: string;
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
          {ctaText}
        </Button>
      </CardContent>
    </Card>
  );
}
