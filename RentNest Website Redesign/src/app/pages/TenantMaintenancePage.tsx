import React, { useState } from "react";
import { Plus, Wrench, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { useMaintenanceTicketsQuery, useCreateTicketMutation, useAddCommentMutation, useCompleteTicketMutation } from "@/features/maintenance/hooks/useMaintenanceData";
import { MaintenanceRequestWizard } from "@/features/maintenance/components/MaintenanceRequestWizard";
import { MaintenanceTicketDetailDrawer } from "@/features/maintenance/components/MaintenanceTicketDetailDrawer";
import { MaintenanceCompletionModal } from "@/features/maintenance/components/MaintenanceCompletionModal";
import type { MaintenanceTicket } from "@/features/maintenance/types/maintenance";

export const TenantMaintenancePage: React.FC = () => {
  const { data: tickets } = useMaintenanceTicketsQuery();
  const createTicketMutation = useCreateTicketMutation();
  const addCommentMutation = useAddCommentMutation();
  const completeTicketMutation = useCompleteTicketMutation();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | undefined>(undefined);
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
            Maintenance & Work Order Requests
          </h1>
          <p className="text-xs text-muted-foreground">
            Submit repair requests, track vendor dispatch timeline, inspect before/after photos, and sign off.
          </p>
        </div>

        <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsWizardOpen(true)}>
          New Ticket Request
        </Button>
      </div>

      {/* Tickets Stream */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tickets?.map((t) => (
          <Card
            key={t.id}
            variant="default"
            className="p-5 cursor-pointer hover:border-primary/50 transition-all space-y-4"
            onClick={() => setSelectedTicket(t)}
          >
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <span className="text-[10px] font-bold text-primary">#{t.ticketNumber}</span>
                <h3 className="font-heading text-sm font-bold text-foreground">{t.issueTitle}</h3>
              </div>
              <StatusBadge status={t.status} />
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-border/20 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> {t.submittedAt}
              </span>
              <span className="font-semibold text-foreground">Vendor: {t.vendorName || "Dispatching..."}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Wizard Modal */}
      <MaintenanceRequestWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={(data) => createTicketMutation.mutate(data)}
      />

      {/* Detail Drawer */}
      {selectedTicket && (
        <MaintenanceTicketDetailDrawer
          ticket={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(undefined)}
          onAddComment={(text) => addCommentMutation.mutate({ ticketId: selectedTicket.id, text, authorName: "Jane Doe", authorRole: "TENANT" })}
          onOpenCompletion={() => setIsCompletionOpen(true)}
          userRole="ROLE_TENANT"
        />
      )}

      {/* Completion Sign-Off Modal */}
      {selectedTicket && (
        <MaintenanceCompletionModal
          isOpen={isCompletionOpen}
          ticketId={selectedTicket.id}
          onClose={() => setIsCompletionOpen(false)}
          onSubmit={(rating, feedback) =>
            completeTicketMutation.mutate({ ticketId: selectedTicket.id, rating, feedback })
          }
        />
      )}
    </div>
  );
};

export default TenantMaintenancePage;
