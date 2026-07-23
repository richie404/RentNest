import { Request, Response } from "express";
import { FinancialService } from "./financial.service";
import { ApiResponse } from "../../utils/response-formatter";

export class FinancialController {
  constructor(private financialService: FinancialService) {}

  public generateInvoice = async (req: Request, res: Response): Promise<Response> => {
    const actorUserId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const result = await this.financialService.generateInvoice(
      actorUserId,
      req.body,
      userAgent,
      ipAddress
    );

    return ApiResponse.created(res, result, "Lease invoice generated successfully.");
  };

  public recordPayment = async (req: Request, res: Response): Promise<Response> => {
    const payerUserId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const result = await this.financialService.recordPayment(
      payerUserId,
      req.body,
      userAgent,
      ipAddress
    );

    return ApiResponse.created(res, result, "Payment transaction recorded and allocated successfully.");
  };

  public getInvoiceById = async (req: Request, res: Response): Promise<Response> => {
    const invoiceId = parseInt(req.params.id, 10);
    const invoice = await this.financialService.getInvoiceById(invoiceId);
    return ApiResponse.success(res, invoice, "Invoice details retrieved successfully.");
  };

  public listInvoices = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const isOwner = req.user!.roleName === "ROLE_PROPERTY_OWNER";
    const invoices = await this.financialService.listInvoices(userId, isOwner);
    return ApiResponse.success(res, invoices, "Lease invoices retrieved successfully.");
  };

  public getRevenueSummary = async (_req: Request, res: Response): Promise<Response> => {
    const summary = await this.financialService.getRevenueSummary();
    return ApiResponse.success(res, summary, "Monthly revenue summary retrieved successfully.");
  };

  public getOwnerDashboardSummary = async (req: Request, res: Response): Promise<Response> => {
    const ownerId = req.user!.userId;
    const summary = await this.financialService.getOwnerDashboardSummary(ownerId);
    return ApiResponse.success(res, summary, "Landlord financial summary retrieved successfully.");
  };
}
