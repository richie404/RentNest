import React from "react";
import { Bell, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { Card } from "../ui/Card";

export interface NotificationCardProps {
  title: string;
  message: string;
  timestamp: string;
  type?: "info" | "warning" | "success";
  unread?: boolean;
  actionText?: string;
  onAction?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  message,
  timestamp,
  type = "info",
  unread = true,
  actionText,
  onAction,
}) => {
  const iconMap = {
    info: <Info className="h-4 w-4 text-blue-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    success: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  };

  return (
    <Card
      variant="default"
      className={`p-4 border transition-colors ${
        unread ? "border-primary/30 bg-primary/5" : "border-border/40 bg-card"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted">
          {iconMap[type] || <Bell className="h-4 w-4 text-primary" />}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-xs font-bold text-foreground">{title}</h4>
            <span className="text-[10px] text-muted-foreground">{timestamp}</span>
          </div>

          <p className="mt-1 text-xs text-muted-foreground leading-normal">{message}</p>

          {actionText && onAction && (
            <button
              onClick={onAction}
              className="mt-2 text-xs font-semibold text-primary hover:underline"
            >
              {actionText} →
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
