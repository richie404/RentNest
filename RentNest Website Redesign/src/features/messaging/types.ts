export type UserRole = "ROLE_TENANT" | "ROLE_PROPERTY_OWNER" | "ROLE_VENDOR" | "ROLE_ADMIN" | "ROLE_SUPPORT";

export interface Participant {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  status: "ONLINE" | "OFFLINE" | "AWAY";
  lastSeen?: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  fileType: "IMAGE" | "PDF" | "DOC";
}

export type MessageStatus = "SENDING" | "SENT" | "DELIVERED" | "READ";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  status: MessageStatus;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  participant: Participant;
  propertyTitle?: string;
  unitNumber?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}
