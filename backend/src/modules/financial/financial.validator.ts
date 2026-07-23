import { z } from "zod";

export const generateInvoiceSchema = z.object({
  body: z.object({
    leaseId: z.number().int().positive("Lease ID must be positive"),
    billingPeriodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Billing start date must be ISO format (YYYY-MM-DD)"),
    billingPeriodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Billing end date must be ISO format (YYYY-MM-DD)"),
    dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be ISO format (YYYY-MM-DD)"),
  }),
});

export const recordPaymentSchema = z.object({
  body: z.object({
    invoiceId: z.number().int().positive("Invoice ID must be positive"),
    amount: z.number().positive("Payment amount must be positive"),
    paymentChannel: z.enum(["STRIPE", "BANK_TRANSFER", "CREDIT_CARD", "CASH", "CHECK"]),
    gatewayTransactionToken: z.string().min(3, "Transaction token is required"),
  }),
});

export const getInvoiceByIdSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
});
