import React from "react";
import { Avatar } from "../ui/Avatar";
import { cn } from "@/lib/utils";

export interface ChatBubbleProps {
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: string;
  isOutgoing?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  senderName,
  senderAvatar,
  message,
  timestamp,
  isOutgoing = false,
}) => {
  return (
    <div className={cn("flex items-end gap-2.5 my-3", isOutgoing ? "justify-end" : "justify-start")}>
      {!isOutgoing && <Avatar src={senderAvatar} fallbackInitials={senderName[0]} size="sm" />}

      <div
        className={cn(
          "max-w-md rounded-2xl p-3.5 text-xs shadow-sm",
          isOutgoing
            ? "bg-primary text-white rounded-br-none"
            : "bg-card border border-border/60 text-foreground rounded-bl-none"
        )}
      >
        <p className="leading-relaxed">{message}</p>
        <span
          className={cn(
            "mt-1 block text-[10px]",
            isOutgoing ? "text-white/70 text-right" : "text-muted-foreground"
          )}
        >
          {timestamp}
        </span>
      </div>

      {isOutgoing && <Avatar src={senderAvatar} fallbackInitials={senderName[0]} size="sm" />}
    </div>
  );
};
