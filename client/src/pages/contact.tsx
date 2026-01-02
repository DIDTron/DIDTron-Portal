import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, MessageSquare, Headphones, Building } from "lucide-react";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  company: z.string().optional(),
  department: z.string().min(1, "Please select a department"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    value: "sales@didtron.com",
    description: "For sales inquiries",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+1 (888) 555-0123",
    description: "Mon-Fri, 9am-6pm EST",
  },
  {
    icon: MapPin,
    title: "Headquarters",
    value: "New York, NY",
    description: "United States",
  },
  {
    icon: Clock,
    title: "Support Hours",
    value: "24/7",
    description: "Enterprise customers",
  },
];

const departments = [
  { value: "sales", label: "Sales" },
  { value: "support", label: "Technical Support" },
  { value: "billing", label: "Billing" },
  { value: "partnerships", label: "Partnerships" },
  { value: "other", label: "Other" },
];

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      department: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
    form.reset();
  };

  return (
    <div>
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">Contact Us</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-contact-title">
              Get in Touch
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions? Our team is here to help. Fill out the form below or reach out directly.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                  <CardDescription>
                    Fill out the form and we'll respond within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} data-testid="input-first-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} data-testid="input-last-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="john@company.com" type="email" {...field} data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 (555) 000-0000" {...field} data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Your company" {...field} data-testid="input-company" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Department</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-department">
                                    <SelectValue placeholder="Select department" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {departments.map((dept) => (
                                    <SelectItem key={dept.value} value={dept.value}>
                                      {dept.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us how we can help..."
                                className="min-h-[120px]"
                                {...field}
                                data-testid="input-message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting} data-testid="button-submit">
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {contactInfo.map((info) => (
                <Card key={info.title} data-testid={`card-contact-${info.title.toLowerCase()}`}>
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                    <div className="w-10 h-10 bg-accent rounded-md flex items-center justify-center">
                      <info.icon className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{info.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="font-medium">{info.value}</div>
                    <div className="text-sm text-muted-foreground">{info.description}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" data-testid="text-support-title">
              Support Options
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-base">Live Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Chat with our team in real-time during business hours.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center mx-auto mb-4">
                  <Headphones className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-base">Phone Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Call us directly for urgent technical issues.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-md flex items-center justify-center mx-auto mb-4">
                  <Building className="w-6 h-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-base">Enterprise</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Dedicated account manager and 24/7 priority support.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
