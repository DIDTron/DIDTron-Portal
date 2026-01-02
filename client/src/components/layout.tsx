import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const footerLinks = {
  product: [
    { href: "/", label: "Voice Termination" },
    { href: "/", label: "DID Numbers" },
    { href: "/", label: "Cloud PBX" },
    { href: "/pricing", label: "Pricing" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/", label: "Careers" },
    { href: "/", label: "Blog" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/", label: "SLA" },
    { href: "/", label: "AUP" },
  ],
  support: [
    { href: "/", label: "Documentation" },
    { href: "/", label: "API Reference" },
    { href: "/", label: "Status Page" },
    { href: "/contact", label: "Support" },
  ],
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3" data-testid="link-logo">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl hidden sm:block">DIDTron</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={location === link.href ? "secondary" : "ghost"}
                    size="sm"
                    data-testid={`link-nav-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/contact">
                <Button variant="outline" size="sm" className="hidden sm:flex" data-testid="button-login">
                  Login
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="sm" data-testid="button-get-started">
                  Get Started
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={location === link.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    data-testid={`link-mobile-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">DIDTron</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Enterprise-grade VoIP solutions for carriers, businesses, and call centers worldwide.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              2026 DIDTron Communications. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
