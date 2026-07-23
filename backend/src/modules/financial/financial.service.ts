import { FinancialRepository } from "../../repositories/financial.repository";
import { AuditLogRepository } from "../../repositories/audit-log.repository";
import { GenerateInvoiceDTO, RecordPaymentDTO } from "./financial.types";
import { NotFoundError, BadRequestError } from "../../utils/app-error";
import { withTransaction } from "../../utils/transaction.util";

export class FinancialService {
  constructor(
    private financialRepository: FinancialRepository,
    private auditLogRepository: AuditLogRepository
  ) {}

  public async generateInvoice(
    actorUserId: number,
    dto: GenerateInvoiceDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ invoiceId: number; statusMessage: string }> {
    return await withTransaction(async (connection) => {
      const result = await this.financialRepository.generateInvoice(dto, connection);

      if (result.statusMessage.startsWith("ERROR:")) {
        throw new BadRequestError(result.statusMessage);
      }

      await this.auditLogRepository.logAction(
        {
          actorUserId,
          actionType: "INSERT",
          targetTable: "lease_invoices",
          recordKey: String(result.invoiceId),
          userAgent,
          ipAddress,
          postImageJson: { dto, invoiceId: result.invoiceId },
        },
        connection
      );

      return result;
    });
  }

  public async recordPayment(
    payerUserId: number,
    dto: RecordPaymentDTO,
    userAgent?: string,
    ipAddress?: string
  ): Promise<{ paymentId: number; statusMessage: string }> {
    return await withTransaction(async (connection) => {
      const result = await this.financialRepository.recordPayment(
        {
          payerUserId,
          invoiceId: dto.invoiceId,
          amount: dto.amount,
          paymentChannel: dto.paymentChannel,
          gatewayTransactionToken: dto.gatewayTransactionToken,
        },
        connection
      );

      if (result.statusMessage.startsWith("ERROR:")) {
        throw new BadRequestError(result.statusMessage);
      }

      await this.auditLogRepository.logAction(
        {
          actorUserId: payerUserId,
          actionType: "INSERT",
          targetTable: "payments",
          recordKey: String(result.paymentId),
          userAgent,
          ipAddress,
          postImageJson: { dto, paymentId: result.paymentId },
        },
        connection
      );

      return result;
    });
  }

  public async getInvoiceById(invoiceId: number): Promise<any> {
    const invoice = await this.financialRepository.findInvoiceById(invoiceId);
    if (!invoice) {
      throw new NotFoundError(`Lease invoice with ID ${invoiceId} does not exist.`);
    }
    return invoice;
  }

  public async listInvoices(userId: number, isOwner: boolean = false): Promise<any[]> {
    return this.financialRepository.listInvoices(userId, isOwner);
  }

  public async getRevenueSummary(): Promise<any[]> {
    return this.financialRepository.getRevenueSummary();
  }

  public async getOwnerDashboardSummary(ownerId: number): Promise<any> {
    const summary = await this.financialRepository.getOwnerDashboardSummary(ownerId);
    if (!summary) {
      return {
        owner_id: ownerId,
        total_properties_owned: 0,
        total_units_managed: 0,
        vacant_units_count: 0,
        occupied_units_count: 0,
        portfolio_occupancy_rate: 0,
        total_net_payouts_received: 0,
        open_maintenance_requests_count: 0,
      };
    }
    return summary;
  }
}
