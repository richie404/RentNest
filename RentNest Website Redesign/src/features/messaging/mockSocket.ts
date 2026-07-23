import type { Message, MessageStatus } from "./types";
import { showToast } from "@/components/ui/Toast";

type SocketEventListener = (data: any) => void;

class MockSocketEngine {
  private listeners: Map<string, SocketEventListener[]> = new Map();
  public isConnected: boolean = true;

  constructor() {
    console.log("[MockSocket] Initialized real-time simulation engine");
  }

  public on(event: string, callback: SocketEventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: SocketEventListener) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event)!.filter((cb) => cb !== callback);
    this.listeners.set(event, callbacks);
  }

  public emit(event: string, data: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((cb) => cb(data));
    }
  }

  public sendMessage(msg: Message) {
    // 1. Immediately emit SENDING state
    this.emit("message_sending", { ...msg, status: "SENDING" });

    // 2. After 400ms -> SENT
    setTimeout(() => {
      this.emit("message_sent", { ...msg, status: "SENT" });
    }, 400);

    // 3. After 1200ms -> DELIVERED
    setTimeout(() => {
      this.emit("message_delivered", { ...msg, status: "DELIVERED" });
    }, 1200);

    // 4. Simulate typing response from participant after 1800ms
    setTimeout(() => {
      this.emit("typing_start", { conversationId: msg.conversationId, senderName: "Alexander Vance" });
    }, 1800);

    // 5. After 3800ms -> READ status + Stop typing + Incoming message response!
    setTimeout(() => {
      this.emit("message_read", { messageId: msg.id, conversationId: msg.conversationId });
      this.emit("typing_stop", { conversationId: msg.conversationId });

      const replies = [
        "Received your message! I'm reviewing the work order details right now.",
        "Thanks for updating me. The maintenance technician has been notified.",
        "Got it! I will check the property records and get back to you shortly.",
        "Thank you! Everything looks good on our end.",
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      const incomingMsg: Message = {
        id: `MSG-INC-${Date.now()}`,
        conversationId: msg.conversationId,
        senderId: "USR-102",
        senderName: "Alexander Vance",
        senderRole: "ROLE_PROPERTY_OWNER",
        content: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "DELIVERED",
      };

      this.emit("incoming_message", incomingMsg);
      showToast.info(`New message from Alexander Vance`, randomReply);
    }, 4200);
  }
}

export const mockSocket = new MockSocketEngine();
