import React, { useState, useRef, useEffect } from "react";
import { Send, Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";
import type { Conversation, Message, Attachment } from "../types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { AttachmentPicker } from "./AttachmentPicker";

interface MessengerViewProps {
  activeConversation?: Conversation;
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  onPreviewImage: (url: string, name?: string) => void;
  onBackMobile?: () => void;
}

export const MessengerView: React.FC<MessengerViewProps> = ({
  activeConversation,
  messages,
  isTyping,
  onSendMessage,
  onPreviewImage,
  onBackMobile,
}) => {
  const [inputText, setInputText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!activeConversation) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center text-xs text-muted-foreground">
        Select a conversation to start messaging.
      </div>
    );
  }

  const p = activeConversation.participant;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && attachments.length === 0) return;
    onSendMessage(inputText, attachments.length > 0 ? attachments : undefined);
    setInputText("");
    setAttachments([]);
  };

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {onBackMobile && (
            <button onClick={onBackMobile} className="md:hidden p-1 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white font-bold text-xs shadow-sm overflow-hidden">
              {p.avatar ? <img src={p.avatar} alt={p.name} className="h-full w-full object-cover" /> : p.name.charAt(0)}
            </div>
            {p.status === "ONLINE" && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
            )}
          </div>

          <div>
            <h3 className="font-heading text-sm font-bold text-foreground">{p.name}</h3>
            <span className="text-[10px] text-muted-foreground">
              {activeConversation.propertyTitle} • {p.role.replace("ROLE_", "")}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
            <Phone className="h-4 w-4" />
          </button>
          <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
            <Video className="h-4 w-4" />
          </button>
          <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onPreviewImage={onPreviewImage} />
        ))}
        {isTyping && <TypingIndicator senderName={p.name} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-border/40 bg-card space-y-2">
        <AttachmentPicker
          attachments={attachments}
          onAddAttachment={(att) => setAttachments((prev) => [...prev, att])}
          onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
        />

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-2xl border border-border/50 bg-background/60 py-2.5 px-4 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={!inputText.trim() && attachments.length === 0}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-md disabled:opacity-50 hover:bg-primary/90 transition-all shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
