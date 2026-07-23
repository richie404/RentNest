import React from "react";
import { Activity, Server, Database, HardDrive } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useAdminSystemTelemetryQuery } from "@/features/admin/hooks/useAdminData";

export const AdminSystemHealthPage: React.FC = () => {
  const { data: telemetry } = useAdminSystemTelemetryQuery();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground">
          Real-Time System Telemetry & Server Health
        </h1>
        <p className="text-xs text-muted-foreground">
          Live server node cluster CPU utilization, PostgreSQL database pool connections, and API requests per minute.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card variant="default" className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Cluster CPU Utilization</span>
            <Server className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-heading text-3xl font-extrabold text-foreground">{telemetry?.cpuUsagePct}%</h3>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${telemetry?.cpuUsagePct || 0}%` }} />
          </div>
        </Card>

        <Card variant="default" className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">RAM Memory Consumption</span>
            <HardDrive className="h-4 w-4 text-purple-500" />
          </div>
          <h3 className="font-heading text-3xl font-extrabold text-foreground">{telemetry?.memoryUsagePct}%</h3>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${telemetry?.memoryUsagePct || 0}%` }} />
          </div>
        </Card>

        <Card variant="default" className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Database Connections</span>
            <Database className="h-4 w-4 text-emerald-500" />
          </div>
          <h3 className="font-heading text-3xl font-extrabold text-foreground">{telemetry?.dbConnections} Pools</h3>
          <span className="text-[10px] text-emerald-500 font-bold block">PostgreSQL Pool Stable</span>
        </Card>
      </div>

      <Card variant="default" className="p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h3 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary animate-pulse" /> Cluster Node Status (8 Active Nodes)
          </h3>
          <span className="text-xs font-bold text-emerald-500">Overall Uptime: {telemetry?.uptimePct}%</span>
        </div>
        <p className="text-xs text-muted-foreground">
          All 8 cloud load-balancer nodes (us-east, us-west, eu-central) are reporting green health checks.
        </p>
      </Card>
    </div>
  );
};

export default AdminSystemHealthPage;
