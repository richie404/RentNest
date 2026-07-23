import type { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { dbPool } from "../config/database.config";

export interface GenerateInvoiceDTO {
  leaseId: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
}

export interface RecordPaymentDTO {
  payerUserId: number;
  invoiceId: number;
  amount: number;
  paymentChannel: string;
  gatewayTransactionToken: string;
}

export class FinancialRepository {
  private getDb(connection?: PoolConnection) {
    return connection || dbPool;
  }

  /**
   * Generate lease invoice via sp_GenerateInvoice
   */
  public async generateInvoice(
    dto: GenerateInvoiceDTO,
    connection?: PoolConnection
  ): Promise<{ invoiceId: number; statusMessage: string }> {
    const db = this.getDb(connection);
    await db.query<RowDataPacket[][]>(
      "CALL sp_GenerateInvoice(?, ?, ?, ?, @out_invoice_id, @out_status_message)",
      [dto.leaseId, dto.billingPeriodStart, dto.billingPeriodEnd, dto.dueDate]
    );

    const [outRows] = await db.query<RowDataPacket[]>(
      "SELECT @out_invoice_id AS invoiceId, @out_status_message AS statusMessage"
    );

    const invoiceId = Number(outRows[0]?.invoiceId || 0);
    const statusMessage = String(outRows[0]?.statusMessage || "");

    return { invoiceId, statusMessage };
  }

  /**
   * Record payment via sp_CreatePayment
   */
  public async recordPayment(
    dto: RecordPaymentDTO,
    connection?: PoolConnection
  ): Promise<{ paymentId: number; statusMessage: string }> {
    const db = this.getDb(connection);
    await db.query<RowDataPacket[][]>(
      "CALL sp_CreatePayment(?, ?, ?, ?, ?, @out_payment_id, @out_status_message)",
      [
        dto.payerUserId,
        dto.invoiceId,
        dto.amount,
        dto.paymentChannel,
        dto.gatewayTransactionToken,
      ]
    );

    const [outRows] = await db.query<RowDataPacket[]>(
      "SELECT @out_payment_id AS paymentId, @out_status_message AS statusMessage"
    );

    const paymentId = Number(outRows[0]?.paymentId || 0);
    const statusMessage = String(outRows[0]?.statusMessage || "");

    return { paymentId, statusMessage };
  }

  /**
   * Find invoice by ID
   */
  public async findInvoiceById(
    invoiceId: number,
    connection?: PoolConnection
  ): Promise<any | null> {
    const db = this.getDb(connection);
    const sql = `
      SELECT 
        li.invoice_id AS invoiceId, li.lease_id AS leaseId, li.billing_period_start AS billingPeriodStart,
        li.billing_period_end AS billingPeriodEnd, li.due_date AS dueDate, li.total_amount_due AS totalAmountDue,
        li.payment_status AS paymentStatus, l.unit_id AS unitId, u.unit_number AS unitNumber, p.property_name AS propertyName
      FROM lease_invoices li
      JOIN leases l ON li.lease_id = l.lease_id
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      WHERE li.invoice_id = ?
      LIMIT 1
    `;

    const [rows] = await db.execute<RowDataPacket[]>(sql, [invoiceId]);
    return rows[0] || null;
  }

  /**
   * List invoices for user/lease
   */
  public async listInvoices(
    userId: number,
    isOwner: boolean = false,
    connection?: PoolConnection
  ): Promise<any[]> {
    const db = this.getDb(connection);
    let sql = `
      SELECT 
        li.invoice_id AS invoiceId, li.lease_id AS leaseId, li.billing_period_start AS billingPeriodStart,
        li.due_date AS dueDate, li.total_amount_due AS totalAmountDue, li.payment_status AS paymentStatus,
        p.property_name AS propertyName, u.unit_number AS unitNumber
      FROM lease_invoices li
      JOIN leases l ON li.lease_id = l.lease_id
      JOIN units u ON l.unit_id = u.unit_id
      JOIN properties p ON u.property_id = p.property_id
      LEFT JOIN lease_signers ls ON l.lease_id = ls.lease_id
    `;

    if (isOwner) {
      sql += " WHERE p.owner_id = ? GROUP BY li.invoice_id ORDER BY li.due_date DESC";
    } else {
      sql += " WHERE ls.user_id = ? GROUP BY li.invoice_id ORDER BY li.due_date DESC";
    }

    const [rows] = await db.execute<RowDataPacket[]>(sql, [userId]);
    return rows as any;
  }

  /**
   * Fetch revenue summary stats from vw_monthly_revenue_summary
   */
  public async getRevenueSummary(connection?: PoolConnection): Promise<any[]> {
    const db = this.getDb(connection);
    const sql = `SELECT * FROM vw_monthly_revenue_summary ORDER BY billing_month DESC LIMIT 12`;
    const [rows] = await db.execute<RowDataPacket[]>(sql);
    return rows as any;
  }

  /**
   * Fetch landlord financial summary from vw_owner_dashboard_summary
   */
  public async getOwnerDashboardSummary(
    ownerId: number,
    connection?: PoolConnection
  ): Promise<any | null> {
    const db = this.getDb(connection);
    const sql = `SELECT * FROM vw_owner_dashboard_summary WHERE owner_id = ? LIMIT 1`;
    const [rows] = await db.execute<RowDataPacket[]>(sql, [ownerId]);
    return rows[0] || null;
  }
}
