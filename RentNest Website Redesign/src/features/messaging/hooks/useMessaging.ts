import { useState, useEffect, useCallback } from "react";
import { mockSocket } from "../mockSocket";
import { messagingService } from "../services/messagingService";
import type { Conversation, Message } from "../types";

export const useMessaging = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("CONV-1");
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [isTypingMap, setIsTypingMap] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Initial load
  useEffect(() => {
    messagingService.getConversations().then((convs) => {
      setConversations(convs);
      if (convs.length > 0 && !activeConversationId) {
        setActiveConversationId(convs[0].id);
      }
    });
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;
    messagingService.getMessages(activeConversationId).then((msgs) => {
      setMessagesMap((prev) => ({ ...prev, [activeConversationId]: msgs }));
    });
  }, [activeConversationId]);

  // Connect mock socket listeners
  useEffect(() => {
    const handleSending = (msg: Message) => {
      setMessagesMap((prev) => ({
        ...prev,
        [msg.conversationId]: [...(prev[msg.conversationId] || []), msg],
      }));
    };

    const handleSent = (msg: Message) => {
      setMessagesMap((prev) => ({
        ...prev,
        [msg.conversationId]: (prev[msg.conversationId] || []).map((m) =>
          m.id === msg.id ? { ...m, status: "SENT" } : m
        ),
      }));
    };

    const handleDelivered = (msg: Message) => {
      setMessagesMap((prev) => ({
        ...prev,
        [msg.conversationId]: (prev[msg.conversationId] || []).map((m) =>
          m.id === msg.id ? { ...m, status: "DELIVERED" } : m
        ),
      }));
    };

    const handleRead = ({ messageId, conversationId }: { messageId: string; conversationId: string }) => {
      setMessagesMap((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map((m) =>
          m.id === messageId ? { ...m, status: "READ" } : m
        ),
      }));
    };

    const handleTypingStart = ({ conversationId }: { conversationId: string }) => {
      setIsTypingMap((prev) => ({ ...prev, [conversationId]: true }));
    };

    const handleTypingStop = ({ conversationId }: { conversationId: string }) => {
      setIsTypingMap((prev) => ({ ...prev, [conversationId]: false }));
    };

    const handleIncomingMessage = (incomingMsg: Message) => {
      setMessagesMap((prev) => ({
        ...prev,
        [incomingMsg.conversationId]: [...(prev[incomingMsg.conversationId] || []), incomingMsg],
      }));

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === incomingMsg.conversationId
            ? { ...c, lastMessage: incomingMsg.content, lastMessageTime: incomingMsg.timestamp }
            : c
        )
      );
    };

    mockSocket.on("message_sending", handleSending);
    mockSocket.on("message_sent", handleSent);
    mockSocket.on("message_delivered", handleDelivered);
    mockSocket.on("message_read", handleRead);
    mockSocket.on("typing_start", handleTypingStart);
    mockSocket.on("typing_stop", handleTypingStop);
    mockSocket.on("incoming_message", handleIncomingMessage);

    return () => {
      mockSocket.off("message_sending", handleSending);
      mockSocket.off("message_sent", handleSent);
      mockSocket.off("message_delivered", handleDelivered);
      mockSocket.off("message_read", handleRead);
      mockSocket.off("typing_start", handleTypingStart);
      mockSocket.off("typing_stop", handleTypingStop);
      mockSocket.off("incoming_message", handleIncomingMessage);
    };
  }, []);

  const sendMessage = useCallback(
    (text: string, attachments?: Message["attachments"]) => {
      if (!activeConversationId || (!text.trim() && (!attachments || attachments.length === 0))) return;

      const newMsg: Message = {
        id: `MSG-${Date.now()}`,
        conversationId: activeConversationId,
        senderId: "ME",
        senderName: "Jane Doe",
        senderRole: "ROLE_TENANT",
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "SENDING",
        attachments,
      };

      mockSocket.sendMessage(newMsg);

      // Update conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, lastMessage: text || "Attachment sent", lastMessageTime: newMsg.timestamp }
            : c
        )
      );
    },
    [activeConversationId]
  );

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const activeMessages = messagesMap[activeConversationId] || [];
  const isTyping = isTypingMap[activeConversationId] || false;

  const filteredConversations = conversations.filter(
    (c) =>
      c.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.propertyTitle && c.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return {
    conversations: filteredConversations,
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    messages: activeMessages,
    isTyping,
    sendMessage,
    searchQuery,
    setSearchQuery,
  };
};
