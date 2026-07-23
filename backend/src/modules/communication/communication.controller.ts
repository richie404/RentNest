import { Request, Response } from "express";
import { CommunicationService } from "./communication.service";
import { ApiResponse } from "../../utils/response-formatter";

export class CommunicationController {
  constructor(private communicationService: CommunicationService) {}

  public createConversation = async (req: Request, res: Response): Promise<Response> => {
    const actorUserId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const result = await this.communicationService.createConversation(
      actorUserId,
      req.body,
      userAgent,
      ipAddress
    );

    return ApiResponse.created(res, result, "Conversation thread created successfully.");
  };

  public sendMessage = async (req: Request, res: Response): Promise<Response> => {
    const senderUserId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const result = await this.communicationService.sendMessage(
      senderUserId,
      req.body,
      userAgent,
      ipAddress
    );

    return ApiResponse.created(res, result, "Message dispatched successfully.");
  };

  public listMessages = async (req: Request, res: Response): Promise<Response> => {
    const conversationId = parseInt(req.params.id, 10);
    const messages = await this.communicationService.listMessages(conversationId);
    return ApiResponse.success(res, messages, "Conversation messages retrieved successfully.");
  };

  public sendNotification = async (req: Request, res: Response): Promise<Response> => {
    const actorUserId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const result = await this.communicationService.sendNotification(
      actorUserId,
      req.body,
      userAgent,
      ipAddress
    );

    return ApiResponse.created(res, result, "Notification queued and sent successfully.");
  };

  public listNotifications = async (req: Request, res: Response): Promise<Response> => {
    const recipientUserId = req.user!.userId;
    const notifications = await this.communicationService.listUserNotifications(recipientUserId);
    return ApiResponse.success(res, notifications, "User notifications retrieved successfully.");
  };
}
