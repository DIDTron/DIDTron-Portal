import type { Express } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { sendPaymentReceived } from "../brevo";

export function registerPortalUserRoutes(app: Express): void {
  // Get logged-in user's customer profile with balance
  app.get("/api/my/profile", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const customer = await storage.getCustomer(user.customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Update logged-in user's customer profile settings
  app.patch("/api/my/profile", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      
      const profileUpdateSchema = z.object({
        autoTopUpEnabled: z.boolean().optional(),
        autoTopUpAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        autoTopUpThreshold: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        displayCurrency: z.string().min(3).max(3).optional(),
      });
      
      const validation = profileUpdateSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid data", details: validation.error.errors });
      }
      
      const updateData = validation.data;
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }
      
      const updated = await storage.updateCustomer(user.customerId, updateData);
      if (!updated) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Get logged-in user's payments/transactions
  app.get("/api/my/payments", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.json([]);
      }
      const payments = await storage.getPayments(user.customerId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  // Get logged-in user's invoices
  app.get("/api/my/invoices", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.json([]);
      }
      const invoices = await storage.getInvoices(user.customerId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  // Add funds to logged-in user's account (creates pending payment intent)
  app.post("/api/my/add-funds", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user?.customerId) {
        return res.status(404).json({ error: "Customer profile not found" });
      }
      const customer = await storage.getCustomer(user.customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      
      const { amount, method } = req.body;
      const validMethods = ["card", "paypal"];
      if (!amount || typeof amount !== "number" || amount < 5 || amount > 10000) {
        return res.status(400).json({ error: "Amount must be between $5 and $10,000" });
      }
      if (method && !validMethods.includes(method)) {
        return res.status(400).json({ error: "Invalid payment method" });
      }

      const payment = await storage.createPayment({
        customerId: user.customerId,
        amount: amount.toFixed(2),
        paymentMethod: method || "card",
        status: "pending",
        description: `Account top-up via ${method || "card"}`,
      });

      res.json({ 
        success: true, 
        payment,
        message: "Payment intent created. Awaiting confirmation.",
      });
    } catch (error) {
      console.error("Add funds error:", error);
      res.status(500).json({ error: "Failed to initiate payment" });
    }
  });

  // Webhook endpoint to confirm payments (called by Stripe/PayPal)
  app.post("/api/webhooks/payment-confirmed", async (req, res) => {
    try {
      const { paymentId, transactionId } = req.body;
      
      const payment = await storage.getPayment(paymentId);
      if (!payment || payment.status !== "pending") {
        return res.status(400).json({ error: "Invalid or already processed payment" });
      }

      await storage.updatePayment(paymentId, { 
        status: "completed",
        transactionId 
      });

      const customer = await storage.getCustomer(payment.customerId);
      if (customer) {
        const newBalance = (parseFloat(customer.balance || "0") + parseFloat(payment.amount)).toFixed(2);
        await storage.updateCustomer(payment.customerId, { balance: newBalance });
        
        try {
          await sendPaymentReceived(storage, {
            email: customer.billingEmail || "",
            firstName: customer.companyName || "Customer",
            amount: payment.amount,
            paymentMethod: payment.paymentMethod || "Credit Card",
            transactionId: transactionId || payment.id,
            newBalance,
          });
        } catch (emailErr) {
          console.error("Failed to send payment email:", emailErr);
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Payment webhook error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });
}
