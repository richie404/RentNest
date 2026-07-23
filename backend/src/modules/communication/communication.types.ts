export interface CreateConversationDTO {
  contextType: "LEASE" | "APPLICATION" | "MAINTENANCE";
  contextId: number;
}

export interface SendMessageDTO {
  conversationId: number;
  messageBody: string;
  attachmentUrl?: string;
}

export interface SendNotificationDTO {
  recipientUserId: number;
  channelType: "EMAIL" | "SMS" | "IN_APP" | "PUSH";
  title: string;
  messageBody: string;
}
