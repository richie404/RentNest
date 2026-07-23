import React, { useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { MaintenanceComment } from "../types/maintenance";

interface MaintenanceCommentsThreadProps {
  comments?: MaintenanceComment[];
  onAddComment: (text: string) => void;
}

export const MaintenanceCommentsThread: React.FC<MaintenanceCommentsThreadProps> = ({
  comments = [],
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(commentText);
    setCommentText("");
  };

  return (
    <div className="space-y-3">
      <h4 className="font-heading text-xs font-bold text-foreground flex items-center gap-1.5">
        <MessageSquare className="h-4 w-4 text-primary" /> Activity Log & Ticket Discussion
      </h4>

      {/* Stream */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {comments.map((c) => (
          <div key={c.id} className="p-3 rounded-2xl bg-card border border-border/40 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">
                {c.authorName} <span className="text-[10px] text-muted-foreground font-normal">({c.authorRole})</span>
              </span>
              <span className="text-[10px] text-muted-foreground">{c.timestamp}</span>
            </div>
            <p className="text-muted-foreground">{c.text}</p>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          placeholder="Add a comment or note..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="text-xs"
        />
        <Button type="submit" variant="primary" size="sm">
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
};
