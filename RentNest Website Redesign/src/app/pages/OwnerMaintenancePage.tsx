import React, { useState } from "react";
import { Wrench, CheckCircle2, UserCheck, BarChart2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  useMaintenanceTicketsQuery,
  useAssignVendorMutation,
  useApproveInvoiceMutation,
  useAddCommentMutation,
} from "@/features/maintenance/hooks/useMaintenanceData";
import { MaintenanceAnalyticsDashboard } from "@/features/maintenance/components/MaintenanceAnalyticsDashboard";
import { MaintenanceTicketDetailDrawer } from "@/features/maintenance/components/MaintenanceTicketDetailDrawer";
import { VendorAssignmentModal } from "@/features/maintenance/components/VendorAssignmentModal";
import type { MaintenanceTicket } from "@/features/maintenance/types/maintenance";

export const OwnerMaintenancePage: React.FC = () => {
  const { data: tickets } = useMaintenanceTicketsQuery();
  const assignVendorMutation = useAssignVendorMutation();
  const approveInvoiceMutation = useApproveInvoiceMutation();
  const addCommentMutation = useAddCommentMutation();

  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | undefined>(undefined);
  const [assigningTicketId, setAssigningTicketId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"TICKETS" | "ANALYTICS">("TICKETS");

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
            Capital Maintenance & Repairs Supervisor
          </h1>
          <p className="text-xs text-muted-foreground">
            Authorize repair estimates, dispatch vendor technicians, review before/after photos, and track yield impact.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "TICKETS" ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveTab("TICKETS")}
            leftIcon={<Wrench className="h-4 w-4" />}
          >
            Work Orders Queue
          </Button>
          <Button
            variant={activeTab === "ANALYTICS" ? "primary" : "outline"}
            size="sm"
            onClick={() => setActiveTab("ANALYTICS")}
            leftIcon={<BarChart2 className="h-4 w-4" />}
          >
            Analytics & Costs
          </Button>
        </div>
      </div>

      {activeTab === "ANALYTICS" ? (
        <MaintenanceAnalyticsDashboard />
      ) : (
        <div className="space-y-4">
          {tickets?.map((t) => (
            <Card key={t.id} variant="default" className="p-5 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/40 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-sm font-bold text-foreground">{t.issueTitle}</h3>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.propertyTitle} ({t.unitNumber}) • Tenant: {t.tenantName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!t.vendorName && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAssigningTicketId(t.id)}
                      leftIcon={<UserCheck className="h-3.5 w-3.5" />}
                    >
                      Assign Vendor
                    </Button>
                  )}

                  {t.invoice && t.invoice.status === "PENDING_APPROVAL" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => approveInvoiceMutation.mutate(t.id)}
                      leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                    >
                      Authorize Invoice (${t.invoice.total})
                    </Button>
                  )}

                  <Button variant="secondary" size="sm" onClick={() => setSelectedTicket(t)}>
                    View Details
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Category</span>
                  <strong className="text-foreground">{t.category}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Priority</span>
                  <strong className="text-rose-500">{t.priority}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Assigned Vendor</span>
                  <strong className="text-foreground">{t.vendorName || "Unassigned"}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Submitted Date</span>
                  <strong className="text-foreground">{t.submittedAt}</strong>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Ticket Detail Drawer */}
      {selectedTicket && (
        <MaintenanceTicketDetailDrawer
          ticket={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(undefined)}
          onAddComment={(text) => addCommentMutation.mutate({ ticketId: selectedTicket.id, text, authorName: "Alexander Vance", authorRole: "OWNER" })}
          onApproveInvoice={() => approveInvoiceMutation.mutate(selectedTicket.id)}
          onOpenVendorAssignment={() => setAssigningTicketId(selectedTicket.id)}
          userRole="ROLE_PROPERTY_OWNER"
        />
      )}

      {/* Vendor Assignment Modal */}
      {assigningTicketId && (
        <VendorAssignmentModal
          isOpen={!!assigningTicketId}
          ticketId={assigningTicketId}
          onClose={() => setAssigningTicketId(undefined)}
          onAssign={(vendorName, vendorPhone) =>
            assignVendorMutation.mutate({ ticketId: assigningTicketId, vendorName, vendorPhone })
          }
        />
      )}
    </div>
  );
};

export default OwnerMaintenancePage;
