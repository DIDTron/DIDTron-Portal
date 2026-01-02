import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Phone, Globe, Server, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const plans = [
  {
    name: "Starter",
    description: "For small businesses getting started",
    price: "$49",
    period: "/month",
    features: [
      "Up to 10 SIP channels",
      "5 CPS (calls per second)",
      "5 DID numbers included",
      "Basic PBX features",
      "Email support",
      "Standard voice tier",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    description: "For growing businesses",
    price: "$199",
    period: "/month",
    features: [
      "Up to 50 SIP channels",
      "20 CPS",
      "25 DID numbers included",
      "Full PBX features",
      "IVR and call queues",
      "Priority support",
      "Silver + Gold voice tiers",
      "Real-time analytics",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: "Custom",
    period: "",
    features: [
      "Unlimited SIP channels",
      "Unlimited CPS",
      "Volume DID pricing",
      "All PBX features",
      "White-label portal",
      "24/7 dedicated support",
      "All voice tiers",
      "Custom integrations",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const voiceTiers = [
  { name: "Gold", asr: "98%", rate: "$0.012", description: "Premium CLI routes, highest quality" },
  { name: "Platinum", asr: "95%", rate: "$0.008", description: "High quality business routes" },
  { name: "Silver", asr: "90%", rate: "$0.005", description: "Standard quality routes" },
  { name: "Instant", asr: "85%", rate: "$0.003", description: "Cost-effective for high volume" },
];

const faqs = [
  {
    question: "What is a SIP channel?",
    answer: "A SIP channel represents one concurrent call. If you have 10 channels, you can handle 10 simultaneous calls. Additional channels can be purchased as needed.",
  },
  {
    question: "How does billing work?",
    answer: "We offer both prepaid and postpaid billing. Prepaid customers add credit to their account and calls are deducted in real-time. Postpaid customers receive monthly invoices with net-30 terms.",
  },
  {
    question: "Can I port my existing numbers?",
    answer: "Yes, we support number porting from most carriers. The process typically takes 2-4 weeks and we handle all paperwork for you.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, ACH bank transfers, wire transfers, and PayPal. Enterprise customers can arrange custom payment terms.",
  },
  {
    question: "Is there a contract or commitment?",
    answer: "No long-term contracts required. All plans are month-to-month and you can upgrade, downgrade, or cancel anytime.",
  },
  {
    question: "What support is included?",
    answer: "All plans include email support. Professional plans get priority support with faster response times. Enterprise customers get 24/7 dedicated support with a named account manager.",
  },
];

export default function Pricing() {
  return (
    <div>
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Pricing</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-pricing-title">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No hidden fees. No surprises. Choose the plan that fits your business needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
                data-testid={`card-plan-${plan.name.toLowerCase()}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 text-left">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/contact" className="w-full">
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      data-testid={`button-plan-${plan.name.toLowerCase()}`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-voice-pricing-title">
              Voice Termination Rates
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Per-minute rates for different quality tiers. Volume discounts available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {voiceTiers.map((tier) => (
              <Card key={tier.name} className="text-center" data-testid={`card-tier-${tier.name.toLowerCase()}`}>
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>{tier.asr} ASR</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">{tier.rate}</div>
                  <div className="text-sm text-muted-foreground">per minute</div>
                  <p className="text-sm text-muted-foreground mt-4">{tier.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-addons-title">
              Add-Ons & Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center">
                  <Phone className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">Additional Channels</CardTitle>
                  <CardDescription>$5/channel/month</CardDescription>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center">
                  <Globe className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">DID Numbers</CardTitle>
                  <CardDescription>From $1/month</CardDescription>
                </div>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center">
                  <Server className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">Call Recording</CardTitle>
                  <CardDescription>$0.003/minute</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-faq-title">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left" data-testid={`faq-question-${index}`}>
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need a Custom Solution?</h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
            Contact our sales team for volume pricing, custom integrations, and enterprise features.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary" data-testid="button-contact-sales">
              Contact Sales <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
