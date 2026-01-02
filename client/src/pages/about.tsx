import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Shield, Zap, Users, Award, Building } from "lucide-react";
import networkImage from "@assets/stock_images/global_network_world_8aaf712a.jpg";
import datacenterImage from "@assets/stock_images/business_telecommuni_61870a59.jpg";

const values = [
  {
    icon: Shield,
    title: "Reliability",
    description: "99.99% uptime SLA backed by redundant infrastructure across 6 global POPs.",
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Continuous improvement with cutting-edge VoIP technology and automation.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description: "Dedicated support and self-service tools designed for your success.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "DIDs in 100+ countries and carrier-grade voice termination worldwide.",
  },
];

const pops = [
  { city: "New York", country: "USA", region: "North America" },
  { city: "Los Angeles", country: "USA", region: "North America" },
  { city: "London", country: "UK", region: "Europe" },
  { city: "Frankfurt", country: "Germany", region: "Europe" },
  { city: "Singapore", country: "Singapore", region: "Asia Pacific" },
  { city: "Sydney", country: "Australia", region: "Asia Pacific" },
];

const milestones = [
  { year: "2018", event: "Founded with a vision to democratize enterprise VoIP" },
  { year: "2019", event: "Launched first POP in New York, reached 100 customers" },
  { year: "2020", event: "Expanded to Europe with London and Frankfurt POPs" },
  { year: "2021", event: "Introduced Cloud PBX and reached 1,000 customers" },
  { year: "2022", event: "Asia Pacific expansion with Singapore and Sydney POPs" },
  { year: "2023", event: "Launched AI-powered route optimization and monitoring" },
  { year: "2024", event: "White-label platform launch, 5,000+ customers served" },
];

export default function About() {
  return (
    <div>
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">About Us</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-about-title">
              Powering Voice Communications Globally
            </h1>
            <p className="text-lg text-muted-foreground">
              DIDTron Communications provides enterprise-grade VoIP solutions to carriers, 
              businesses, and call centers worldwide. Our platform combines reliability, 
              automation, and global reach to transform how businesses communicate.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6" data-testid="text-mission-title">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                To democratize enterprise-grade voice communications by making carrier-quality 
                VoIP services accessible and affordable for businesses of all sizes.
              </p>
              <p className="text-muted-foreground mb-6">
                We believe that every business deserves reliable, feature-rich voice communications 
                without the complexity and cost typically associated with enterprise solutions. 
                Our platform automates 95% of operations, enabling customers to self-serve while 
                maintaining the quality and support expected from a premium provider.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-card rounded-md border">
                  <div className="text-3xl font-bold text-primary">5,000+</div>
                  <div className="text-sm text-muted-foreground">Active Customers</div>
                </div>
                <div className="text-center p-4 bg-card rounded-md border">
                  <div className="text-3xl font-bold text-primary">100M+</div>
                  <div className="text-sm text-muted-foreground">Monthly Minutes</div>
                </div>
              </div>
            </div>
            <div>
              <img 
                src={networkImage} 
                alt="Global network infrastructure" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-values-title">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="text-center" data-testid={`card-value-${value.title.toLowerCase()}`}>
                <CardHeader>
                  <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-infrastructure-title">
              Global Infrastructure
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              6 strategically located Points of Presence for low latency and high availability.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={datacenterImage} 
                alt="Data center" 
                className="rounded-lg shadow-xl"
              />
            </div>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pops.map((pop) => (
                  <Card key={pop.city} data-testid={`card-pop-${pop.city.toLowerCase().replace(/\s/g, '-')}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{pop.city}</CardTitle>
                      <CardDescription>{pop.country}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline">{pop.region}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-timeline-title">Our Journey</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className="flex gap-4" data-testid={`milestone-${milestone.year}`}>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                      {milestone.year.slice(2)}
                    </div>
                    {index < milestones.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <div className="font-semibold">{milestone.year}</div>
                    <div className="text-muted-foreground">{milestone.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-compliance-title">
              Compliance & Security
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-base">SOC 2 Type II</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Audited security controls and data protection
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-base">GDPR Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Full compliance with European data regulations
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center mx-auto mb-4">
                  <Building className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-base">PCI DSS</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Secure payment processing certification
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
