import React from "react";
import { Search, Bell, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTenantSavedSearchesQuery } from "@/features/tenant/hooks/useTenantData";

export const TenantSavedSearchesPage: React.FC = () => {
  const { data: searches } = useTenantSavedSearchesQuery();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Saved Search Alerts
        </h1>
        <p className="text-xs text-muted-foreground">
          Receive email notifications when new property listings match your saved filter criteria.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {searches?.map((s) => (
          <Card key={s.id} variant="default" className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-heading text-xs font-bold text-foreground">{s.searchTitle}</h4>
                <p className="text-[10px] text-muted-foreground">{s.filtersSummary} • Saved {s.savedAt}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" leftIcon={<Bell className="h-3.5 w-3.5" />}>
                Alerts On
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
