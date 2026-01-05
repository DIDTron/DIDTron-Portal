import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Send, ArrowLeft, Paperclip, HelpCircle, AlertCircle, 
  Phone, CreditCard, Wrench, Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const ticketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  priority: z.string().min(1, "Please select a priority"),
  description: z.string().min(20, "Please provide more detail (at least 20 characters)"),
});

type TicketFormData = z.infer<typeof ticketSchema>;

const categories = [
  { value: "billing", label: "Billing & Payments", icon: CreditCard, description: "Invoice, payment, or account balance issues" },
  { value: "technical", label: "Technical Support", icon: Wrench, description: "Configuration, connectivity, or quality issues" },
  { value: "voice", label: "Voice Services", icon: Phone, description: "DIDs, routes, or call quality" },
  { value: "security", label: "Security", icon: Shield, description: "Account security or suspicious activity" },
  { value: "general", label: "General Inquiry", icon: HelpCircle, description: "Other questions or feedback" },
];

export default function NewTicketPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      category: "",
      priority: "medium",
      description: "",
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: TicketFormData) => {
      return apiRequest("POST", "/api/my/tickets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my/tickets"] });
      toast({ title: "Ticket Created", description: "Your support ticket has been submitted" });
      setLocation("/portal/support");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create ticket", variant: "destructive" });
    },
  });

  const onSubmit = (data: TicketFormData) => {
    createTicketMutation.mutate(data);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/portal/support">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Support Ticket</h1>
          <p className="text-muted-foreground">Describe your issue and we'll help you resolve it</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ticket Details</CardTitle>
              <CardDescription>Provide as much detail as possible to help us assist you faster</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief summary of your issue"
                            {...field}
                            data-testid="input-subject"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger data-testid="select-priority">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low - General inquiry</SelectItem>
                              <SelectItem value="medium">Medium - Issue affecting service</SelectItem>
                              <SelectItem value="high">High - Critical impact</SelectItem>
                              <SelectItem value="urgent">Urgent - Service down</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, and what you've already tried."
                            className="min-h-[200px]"
                            {...field}
                            data-testid="input-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button type="button" variant="outline" disabled data-testid="button-attach">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach Files
                    </Button>
                    <Button type="submit" disabled={createTicketMutation.isPending} data-testid="button-submit">
                      <Send className="h-4 w-4 mr-2" />
                      {createTicketMutation.isPending ? "Submitting..." : "Submit Ticket"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.value} className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-primary/10">
                    <cat.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{cat.label}</p>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Response Times</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Urgent</span>
                <span className="font-medium">1 hour</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">High</span>
                <span className="font-medium">4 hours</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Medium</span>
                <span className="font-medium">12 hours</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Low</span>
                <span className="font-medium">24 hours</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
