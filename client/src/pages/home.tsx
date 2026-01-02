import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, Globe, Server, Shield, Zap, Users, 
  CheckCircle, ArrowRight, Star, Building, Headphones,
  BarChart3, Clock, Lock, Cpu
} from "lucide-react";
import heroImage from "@assets/stock_images/global_network_world_0b285a3b.jpg";
import datacenterImage from "@assets/stock_images/business_telecommuni_2eb11916.jpg";
import callcenterImage from "@assets/stock_images/call_center_customer_f987c7f1.jpg";

const voiceTiers = [
  { name: "Gold", asr: "98%", description: "Premium CLI routes", color: "bg-yellow-500" },
  { name: "Platinum", asr: "95%", description: "High quality routes", color: "bg-gray-400" },
  { name: "Silver", asr: "90%", description: "Standard routes", color: "bg-gray-300" },
  { name: "Instant", asr: "85%", description: "Cost-effective", color: "bg-orange-400" },
];

const features = [
  {
    icon: Phone,
    title: "Voice Termination",
    description: "4 quality tiers with ASR up to 98%. Route calls globally with intelligent least-cost routing.",
  },
  {
    icon: Globe,
    title: "Global DIDs",
    description: "Phone numbers in 100+ countries. Automated KYC verification via Stripe Identity.",
  },
  {
    icon: Server,
    title: "Cloud PBX",
    description: "Full Class 5 features: extensions, IVR, queues, ring groups, voicemail, and recording.",
  },
  {
    icon: Cpu,
    title: "6 Global POPs",
    description: "FQDN-based routing for seamless failover without customer reconfiguration.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Monitor ASR, ACD, PDD metrics. Automated alerts and carrier switching.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 compliant. IP whitelisting, 2FA, encrypted communications.",
  },
];

const stats = [
  { value: "99.99%", label: "Uptime SLA" },
  { value: "100+", label: "Countries" },
  { value: "6", label: "Global POPs" },
  { value: "24/7", label: "Support" },
];

const testimonials = [
  {
    quote: "DIDTron transformed our call center operations. The quality and reliability are unmatched.",
    author: "Sarah Chen",
    role: "VP Operations",
    company: "TechFlow Inc",
  },
  {
    quote: "We migrated from 3 different providers. Now everything is unified with better rates.",
    author: "Marcus Johnson",
    role: "CTO",
    company: "CallPro Solutions",
  },
  {
    quote: "The self-service portal saves us hours every week. Our team loves the automation.",
    author: "Elena Rodriguez",
    role: "Director of IT",
    company: "Global Connect",
  },
];

const customerTypes = [
  { icon: Building, name: "SIP Trunk Providers", description: "White-label wholesale termination" },
  { icon: Users, name: "Enterprises", description: "Unified communications for business" },
  { icon: Headphones, name: "Call Centers", description: "High-volume inbound and outbound" },
  { icon: Phone, name: "Individuals", description: "Personal VoIP services" },
];

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/50" />
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4" data-testid="badge-hero">
              Enterprise VoIP Platform
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6" data-testid="text-hero-title">
              White-Label VoIP Solutions for Modern Business
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              Voice termination with 4 quality tiers, DIDs in 100+ countries, and full-featured Cloud PBX. 
              Built for wholesale carriers, enterprises, and call centers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <Button size="lg" data-testid="button-hero-start">
                  Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white" data-testid="button-hero-pricing">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-features-title">
              Everything You Need for Voice Communications
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete VoIP platform with enterprise features, global reach, and 95%+ automation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="hover-elevate" data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s/g, '-')}`}>
                <CardHeader>
                  <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="text-tiers-title">
                4 Voice Quality Tiers
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Choose the right quality-to-cost ratio for your traffic. From premium CLI routes with 98% ASR 
                to cost-effective options for high-volume campaigns.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {voiceTiers.map((tier) => (
                  <div key={tier.name} className="flex items-center gap-3 p-4 bg-card rounded-md border" data-testid={`tier-${tier.name.toLowerCase()}`}>
                    <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                    <div>
                      <div className="font-semibold">{tier.name}</div>
                      <div className="text-sm text-muted-foreground">{tier.asr} ASR</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src={datacenterImage} 
                alt="Data center infrastructure" 
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm opacity-90">Max ASR</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-customers-title">
              Built for Every Business Size
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From individual users to large enterprises and wholesale carriers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {customerTypes.map((type) => (
              <Card key={type.name} className="text-center hover-elevate" data-testid={`card-customer-${type.name.toLowerCase().replace(/\s/g, '-')}`}>
                <CardHeader>
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <type.icon className="w-8 h-8 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{type.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src={callcenterImage} 
                alt="Call center operations" 
                className="rounded-lg shadow-xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6" data-testid="text-automation-title">
                95% Automation with Self-Service
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Customers manage everything from the portal: trunk provisioning, DID ordering, 
                PBX configuration, and billing. Reduce support overhead dramatically.
              </p>
              <ul className="space-y-4">
                {[
                  "Instant SIP trunk provisioning",
                  "Automated DID ordering with KYC",
                  "Self-service PBX configuration",
                  "Real-time usage and billing",
                  "Automated low-balance alerts",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-testimonials-title">
              Trusted by Leading Companies
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our customers say about DIDTron.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-testimonial-${index}`}>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-cta-title">
            Ready to Transform Your Voice Communications?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Start your free trial today. No credit card required. Full access to all features.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" variant="secondary" data-testid="button-cta-trial">
                Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground" data-testid="button-cta-demo">
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
