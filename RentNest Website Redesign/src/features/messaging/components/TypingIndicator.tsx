import React from "react";

interface TypingIndicatorProps {
  senderName: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ senderName }) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border/40 rounded-2xl w-fit text-xs text-muted-foreground animate-pulse">
      <span className="font-medium text-foreground">{senderName}</span> is typing
      <div className="flex items-center gap-1 ml-1">
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
};
