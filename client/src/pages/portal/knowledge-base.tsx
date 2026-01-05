import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, BookOpen, Phone, Globe, CreditCard, Settings, 
  Headphones, Bot, TestTube, Network, ExternalLink, ChevronRight
} from "lucide-react";

interface KbArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  views: number;
}

const categories = [
  { id: "getting-started", label: "Getting Started", icon: BookOpen, count: 12 },
  { id: "voice", label: "Voice Termination", icon: Phone, count: 18 },
  { id: "dids", label: "DIDs & Numbers", icon: Globe, count: 15 },
  { id: "billing", label: "Billing & Payments", icon: CreditCard, count: 9 },
  { id: "pbx", label: "Cloud PBX", icon: Headphones, count: 24 },
  { id: "ai-agent", label: "AI Voice Agent", icon: Bot, count: 8 },
  { id: "sip-tester", label: "SIP Tester", icon: TestTube, count: 6 },
  { id: "class4", label: "Class 4 Softswitch", icon: Network, count: 11 },
  { id: "account", label: "Account Settings", icon: Settings, count: 7 },
];

const popularArticles: KbArticle[] = [
  { id: "1", title: "How to Add Funds to Your Account", category: "Billing", excerpt: "Learn how to top up your prepaid balance using credit card or PayPal", views: 1245 },
  { id: "2", title: "Setting Up Your First DID", category: "DIDs", excerpt: "Step-by-step guide to purchasing and configuring a DID number", views: 987 },
  { id: "3", title: "Voice Route Configuration", category: "Voice", excerpt: "Configure outbound voice routes for optimal quality and cost", views: 856 },
  { id: "4", title: "Creating an AI Voice Agent", category: "AI Agent", excerpt: "Build your first AI-powered voice assistant in minutes", views: 743 },
  { id: "5", title: "Understanding Your Invoice", category: "Billing", excerpt: "A breakdown of invoice line items and billing terms", views: 654 },
  { id: "6", title: "SIP Trunk Setup Guide", category: "PBX", excerpt: "Connect your PBX system to DIDTron via SIP trunking", views: 598 },
];

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredArticles = popularArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || article.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Knowledge Base</h1>
        <p className="text-muted-foreground mb-6">
          Find answers to common questions and learn how to use DIDTron
        </p>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            className="pl-12 h-12 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {categories.map((cat) => (
          <Card 
            key={cat.id} 
            className={`cursor-pointer transition-colors hover-elevate ${selectedCategory === cat.id ? "border-primary" : ""}`}
            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            data-testid={`category-${cat.id}`}
          >
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <cat.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{cat.label}</p>
                  <p className="text-xs text-muted-foreground">{cat.count} articles</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>
                {selectedCategory 
                  ? `${categories.find(c => c.id === selectedCategory)?.label} Articles`
                  : "Popular Articles"
                }
              </CardTitle>
              <CardDescription>
                {selectedCategory 
                  ? "Browse articles in this category"
                  : "Most viewed articles by our customers"
                }
              </CardDescription>
            </div>
            {selectedCategory && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
                Show All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <div 
                  key={article.id} 
                  className="flex items-center justify-between p-4 border rounded-md hover-elevate cursor-pointer"
                  data-testid={`article-${article.id}`}
                >
                  <div className="flex items-start gap-4">
                    <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{article.title}</p>
                      <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{article.category}</Badge>
                    <span className="text-xs text-muted-foreground">{article.views} views</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No Articles Found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or browse categories above
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium mb-1">Can't find what you're looking for?</h3>
              <p className="text-sm text-muted-foreground">
                Our support team is here to help you 24/7
              </p>
            </div>
            <Button data-testid="button-contact-support">
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
