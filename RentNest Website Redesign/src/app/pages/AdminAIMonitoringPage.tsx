import React from "react";
import { Cpu, Zap, DollarSign, Activity } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { useAdminAIMetricsQuery } from "@/features/admin/hooks/useAdminData";

export const AdminAIMonitoringPage: React.FC = () => {
  const { data: metrics = [] } = useAdminAIMetricsQuery();

  const columns = [
    {
      accessorKey: "modelName",
      header: "AI Model Identifier",
      cell: ({ row }: any) => <span className="font-bold text-xs text-foreground">{row.original.modelName}</span>,
    },
    {
      accessorKey: "taskType",
      header: "Specialized Task",
      cell: ({ row }: any) => <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">{row.original.taskType}</span>,
    },
    {
      accessorKey: "avgLatencyMs",
      header: "Avg Latency",
      cell: ({ row }: any) => <span className="font-mono text-xs">{row.original.avgLatencyMs} ms</span>,
    },
    {
      accessorKey: "accuracyRate",
      header: "Model Accuracy",
      cell: ({ row }: any) => <span className="font-bold text-emerald-500">{row.original.accuracyRate}%</span>,
    },
    {
      accessorKey: "costToday",
      header: "Cost (Today)",
      cell: ({ row }: any) => <span className="font-bold text-foreground">${row.original.costToday}</span>,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          AI & Machine Learning Infrastructure Monitor
        </h1>
        <p className="text-xs text-muted-foreground">
          Track yield prediction algorithms, fraud detection models, inference latencies, and token expenditures.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card variant="default" className="p-4 space-y-1">
          <span className="text-xs text-muted-foreground">Active AI Models</span>
          <h3 className="font-heading text-2xl font-extrabold text-foreground">2 Engine Pipelines</h3>
        </Card>
        <Card variant="default" className="p-4 space-y-1">
          <span className="text-xs text-muted-foreground">Daily Tokens Processed</span>
          <h3 className="font-heading text-2xl font-extrabold text-primary">1.34 Million</h3>
        </Card>
        <Card variant="default" className="p-4 space-y-1">
          <span className="text-xs text-muted-foreground">Average Inference Speed</span>
          <h3 className="font-heading text-2xl font-extrabold text-emerald-500">230 ms</h3>
        </Card>
        <Card variant="default" className="p-4 space-y-1">
          <span className="text-xs text-muted-foreground">Daily API Expenditure</span>
          <h3 className="font-heading text-2xl font-extrabold text-amber-500">$42.70</h3>
        </Card>
      </div>

      <DataTable data={metrics} columns={columns} searchPlaceholder="Search AI models..." />
    </div>
  );
};

export default AdminAIMonitoringPage;
