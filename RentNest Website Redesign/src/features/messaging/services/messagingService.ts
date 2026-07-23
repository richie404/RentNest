import type { Conversation, Message } from "../types";

const mockConversations: Conversation[] = [
  {
    id: "CONV-1",
    participant: {
      id: "USR-102",
      name: "Alexander Vance",
      role: "ROLE_PROPERTY_OWNER",
      status: "ONLINE",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    propertyTitle: "Grand Horizon Penthouse",
    unitNumber: "Suite 4501",
    lastMessage: "The technician will arrive at 10:00 AM tomorrow.",
    lastMessageTime: "10:32 AM",
    unreadCount: 1,
  },
  {
    id: "CONV-2",
    participant: {
      id: "USR-103",
      name: "Apex Plumbing Services",
      role: "ROLE_VENDOR",
      status: "ONLINE",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
    },
    propertyTitle: "Grand Horizon Penthouse",
    unitNumber: "Suite 4501",
    lastMessage: "Disposal motor part delivered. Ready to install.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
  },
  {
    id: "CONV-3",
    participant: {
      id: "USR-105",
      name: "RentNest Support Team",
      role: "ROLE_SUPPORT",
      status: "ONLINE",
      avatar: "",
    },
    lastMessage: "Welcome to RentNest Enterprise Messaging!",
    lastMessageTime: "July 20",
    unreadCount: 0,
  },
];

const mockMessagesStore: Record<string, Message[]> = {
  "CONV-1": [
    {
      id: "M-1",
      conversationId: "CONV-1",
      senderId: "USR-102",
      senderName: "Alexander Vance",
      senderRole: "ROLE_PROPERTY_OWNER",
      content: "Hello! Just confirming that the plumber is scheduled for 10:00 AM tomorrow to fix the garbage disposal.",
      timestamp: "10:30 AM",
      status: "READ",
    },
    {
      id: "M-2",
      conversationId: "CONV-1",
      senderId: "ME",
      senderName: "Jane Doe",
      senderRole: "ROLE_TENANT",
      content: "Thank you Alexander! I will be home to let them into Suite 4501.",
      timestamp: "10:32 AM",
      status: "READ",
    },
    {
      id: "M-3",
      conversationId: "CONV-1",
      senderId: "USR-102",
      senderName: "Alexander Vance",
      senderRole: "ROLE_PROPERTY_OWNER",
      content: "The technician will arrive at 10:00 AM tomorrow.",
      timestamp: "10:35 AM",
      status: "DELIVERED",
    },
  ],
  "CONV-2": [
    {
      id: "M-4",
      conversationId: "CONV-2",
      senderId: "USR-103",
      senderName: "Apex Plumbing Services",
      senderRole: "ROLE_VENDOR",
      content: "Disposal motor part delivered. Ready to install.",
      timestamp: "Yesterday",
      status: "READ",
    },
  ],
  "CONV-3": [
    {
      id: "M-5",
      conversationId: "CONV-3",
      senderId: "USR-105",
      senderName: "RentNest Support Team",
      senderRole: "ROLE_SUPPORT",
      content: "Welcome to RentNest Enterprise Messaging! How can we assist you today?",
      timestamp: "July 20",
      status: "READ",
    },
  ],
};

export const messagingService = {
  getConversations: async (): Promise<Conversation[]> => {
    return [...mockConversations];
  },
  getMessages: async (conversationId: string): Promise<Message[]> => {
    return mockMessagesStore[conversationId] || [];
  },
};
