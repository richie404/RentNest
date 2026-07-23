import React from "react";
import { Search, Building2 } from "lucide-react";
import type { Conversation } from "../types";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col h-full border-r border-border/40 bg-card/40">
      {/* Header & Search */}
      <div className="p-4 border-b border-border/40 space-y-3">
        <h2 className="font-heading text-lg font-bold text-foreground">Conversations</h2>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search contacts, messages..."
            className="w-full rounded-xl border border-border/50 bg-background/50 py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Conversations Stream */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.length > 0 ? (
          conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const p = conv.participant;

            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all duration-200",
                  isActive
                    ? "bg-primary/10 border border-primary/20 shadow-sm"
                    : "hover:bg-muted/50 border border-transparent"
                )}
              >
                {/* Avatar & Online Dot */}
                <div className="relative shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white font-bold text-xs shadow-sm overflow-hidden">
                    {p.avatar ? (
                      <img src={p.avatar} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      p.name.charAt(0)
                    )}
                  </div>
                  {p.status === "ONLINE" && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading text-xs font-bold text-foreground truncate">{p.name}</h4>
                    <span className="text-[10px] text-muted-foreground shrink-0">{conv.lastMessageTime}</span>
                  </div>

                  {conv.propertyTitle && (
                    <div className="flex items-center gap-1 text-[10px] text-primary font-medium mt-0.5">
                      <Building2 className="h-3 w-3 shrink-0" />
                      <span className="truncate">{conv.propertyTitle}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-muted-foreground truncate mt-1">{conv.lastMessage}</p>
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-6 text-center text-xs text-muted-foreground">No conversations found.</div>
        )}
      </div>
    </div>
  );
};
