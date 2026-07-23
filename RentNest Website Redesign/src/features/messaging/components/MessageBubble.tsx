import React from "react";
import { Clock, Check, CheckCheck, FileText, Image as ImageIcon } from "lucide-react";
import type { Message } from "../types";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  onPreviewImage: (url: string, name?: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onPreviewImage }) => {
  const isOutgoing = message.senderId === "ME";

  const renderStatus = () => {
    if (!isOutgoing) return null;

    switch (message.status) {
      case "SENDING":
        return <Clock className="h-3 w-3 text-white/60 animate-spin" />;
      case "SENT":
        return <Check className="h-3 w-3 text-white/70" />;
      case "DELIVERED":
        return <CheckCheck className="h-3 w-3 text-white/70" />;
      case "READ":
        return <CheckCheck className="h-3 w-3 text-sky-300 font-bold" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex flex-col max-w-[80%] md:max-w-[65%]", isOutgoing ? "ml-auto items-end" : "mr-auto items-start")}>
      {!isOutgoing && (
        <span className="text-[10px] font-semibold text-muted-foreground mb-1 ml-1">
          {message.senderName} ({message.senderRole.replace("ROLE_", "")})
        </span>
      )}

      <div
        className={cn(
          "rounded-2xl px-4 py-2.5 text-xs shadow-sm space-y-2",
          isOutgoing
            ? "bg-primary text-white rounded-br-none"
            : "bg-card text-foreground border border-border/50 rounded-bl-none"
        )}
      >
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="space-y-1.5">
            {message.attachments.map((att) => (
              <div key={att.id}>
                {att.fileType === "IMAGE" ? (
                  <img
                    src={att.fileUrl}
                    alt={att.fileName}
                    onClick={() => onPreviewImage(att.fileUrl, att.fileName)}
                    className="max-h-48 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity border border-white/20"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/10 border border-white/10 text-xs">
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate">{att.fileName}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Message Text */}
        {message.content && <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>}

        {/* Footer timestamp & status */}
        <div className={cn("flex items-center gap-1.5 text-[10px]", isOutgoing ? "text-white/80 justify-end" : "text-muted-foreground justify-start")}>
          <span>{message.timestamp}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
};
