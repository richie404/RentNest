import { z } from "zod";

export const createConversationSchema = z.object({
  body: z.object({
    contextType: z.enum(["LEASE", "APPLICATION", "MAINTENANCE"]),
    contextId: z.number().int().positive("Context ID must be positive"),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    conversationId: z.number().int().positive("Conversation ID must be positive"),
    messageBody: z.string().min(1, "Message body cannot be empty"),
    attachmentUrl: z.string().url("Attachment must be a valid URL").optional(),
  }),
});

export const sendNotificationSchema = z.object({
  body: z.object({
    recipientUserId: z.number().int().positive("Recipient User ID must be positive"),
    channelType: z.enum(["EMAIL", "SMS", "IN_APP", "PUSH"]),
    title: z.string().min(3, "Title must be at least 3 characters"),
    messageBody: z.string().min(5, "Message body must be at least 5 characters"),
  }),
});

export const getConversationByIdSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),
});
