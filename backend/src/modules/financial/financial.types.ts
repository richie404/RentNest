export interface GenerateInvoiceDTO {
  leaseId: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
}

export interface RecordPaymentDTO {
  invoiceId: number;
  amount: number;
  paymentChannel: "STRIPE" | "BANK_TRANSFER" | "CREDIT_CARD" | "CASH" | "CHECK";
  gatewayTransactionToken: string;
}
