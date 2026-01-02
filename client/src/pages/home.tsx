import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Building, Headphones, User, Globe, Server, Layers, Settings } from "lucide-react";
import type { CustomerCategory, CustomerGroup } from "@shared/schema";

const iconMap: Record<string, typeof Phone> = {
  phone: Phone,
  building: Building,
  headphones: Headphones,
  user: User,
};

export default function Home() {
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<CustomerCategory[]>({
    queryKey: ["/api/categories"],
  });

  const { data: groups = [], isLoading: groupsLoading } = useQuery<CustomerGroup[]>({
    queryKey: ["/api/groups"],
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold" data-testid="text-brand-name">DIDTron Communications</h1>
              <p className="text-sm text-muted-foreground">White-Label VoIP Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" data-testid="button-login">Login</Button>
            <Button size="sm" data-testid="button-signup">Sign Up</Button>
          </div>
        </div>
      </header>

      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4" data-testid="text-hero-title">Enterprise VoIP Solutions</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Voice termination with 4 quality tiers, DIDs in 100+ countries, and full-featured Class 5 PBX.
            Built for wholesale carriers, enterprises, and call centers.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button variant="secondary" size="lg" data-testid="button-get-started">Get Started</Button>
            <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground" data-testid="button-view-pricing">View Pricing</Button>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <section className="mb-12">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div>
              <h3 className="text-2xl font-bold" data-testid="text-categories-title">Customer Categories</h3>
              <p className="text-muted-foreground">Service tiers available on the platform</p>
            </div>
            <Badge variant="secondary" data-testid="badge-category-count">{categories.length} Categories</Badge>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => {
                const IconComponent = iconMap[category.icon || "phone"] || Phone;
                const categoryGroups = groups.filter((g) => g.categoryId === category.id);
                return (
                  <Card key={category.id} className="hover-elevate" data-testid={`card-category-${category.id}`}>
                    <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                      <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <CardDescription>{category.code}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline">{categoryGroups.length} Groups</Badge>
                        <Badge variant={category.isActive ? "default" : "secondary"}>
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section className="mb-12">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div>
              <h3 className="text-2xl font-bold" data-testid="text-groups-title">Customer Groups</h3>
              <p className="text-muted-foreground">Segments within each category for configuration assignment</p>
            </div>
            <Badge variant="secondary" data-testid="badge-group-count">{groups.length} Groups</Badge>
          </div>

          {groupsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-muted rounded w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => {
                const category = categories.find((c) => c.id === group.categoryId);
                return (
                  <Card key={group.id} className="hover-elevate" data-testid={`card-group-${group.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <CardTitle className="text-base">{group.name}</CardTitle>
                        {category && (
                          <Badge variant="outline" className="text-xs">{category.name}</Badge>
                        )}
                      </div>
                      <CardDescription>{group.code}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-2xl font-bold mb-6" data-testid="text-features-title">Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card data-testid="card-feature-voice">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center">
                  <Phone className="w-5 h-5 text-accent-foreground" />
                </div>
                <CardTitle className="text-base">Voice Termination</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">4 quality tiers: Gold (98% ASR), Platinum (95%), Silver (90%), Instant (85%)</p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-dids">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center">
                  <Globe className="w-5 h-5 text-accent-foreground" />
                </div>
                <CardTitle className="text-base">Global DIDs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Phone numbers in 100+ countries with automated KYC verification</p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-pbx">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center">
                  <Server className="w-5 h-5 text-accent-foreground" />
                </div>
                <CardTitle className="text-base">Class 5 PBX</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Extensions, IVR, ring groups, queues, voicemail, and call recording</p>
              </CardContent>
            </Card>

            <Card data-testid="card-feature-pops">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center">
                  <Layers className="w-5 h-5 text-accent-foreground" />
                </div>
                <CardTitle className="text-base">6 Global POPs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">FQDN-based routing for load balancing without reconfiguration</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Phone className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">DIDTron Communications</span>
            </div>
            <p className="text-sm text-muted-foreground">White-Label Multi-Portal VoIP Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
