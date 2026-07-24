import { Request, Response } from "express";
import { PropertyService } from "./property.service";
import { ApiResponse } from "../../utils/response-formatter";

export class PropertyController {
  constructor(private propertyService: PropertyService) {}

  public createProperty = async (req: Request, res: Response): Promise<Response> => {
    const ownerId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const result = await this.propertyService.createProperty(ownerId, req.body, userAgent, ipAddress);
    return ApiResponse.created(res, result, "Property initialized successfully.");
  };

  public getPropertyById = async (req: Request, res: Response): Promise<Response> => {
    const propertyId = parseInt(req.params.id as string, 10);
    const property = await this.propertyService.getPropertyById(propertyId);
    return ApiResponse.success(res, property, "Property details retrieved successfully.");
  };

  public searchProperties = async (req: Request, res: Response): Promise<Response> => {
    const { data, meta } = await this.propertyService.searchProperties(req.query as any);
    return ApiResponse.paginated(res, data, meta, "Property search listings retrieved.");
  };

  public updateProperty = async (req: Request, res: Response): Promise<Response> => {
    const propertyId = parseInt(req.params.id as string, 10);
    const requestorUserId = req.user!.userId;
    const requestorRole = req.user!.roleName;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const updated = await this.propertyService.updateProperty(
      propertyId,
      requestorUserId,
      requestorRole,
      req.body,
      userAgent,
      ipAddress
    );

    return ApiResponse.success(res, updated, "Property updated successfully.");
  };

  public deleteProperty = async (req: Request, res: Response): Promise<Response> => {
    const propertyId = parseInt(req.params.id as string, 10);
    const requestorUserId = req.user!.userId;
    const requestorRole = req.user!.roleName;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    await this.propertyService.deleteProperty(
      propertyId,
      requestorUserId,
      requestorRole,
      userAgent,
      ipAddress
    );

    return ApiResponse.success(res, null, "Property deleted successfully.");
  };

  public approveProperty = async (req: Request, res: Response): Promise<Response> => {
    const propertyId = parseInt(req.params.id as string, 10);
    const adminUserId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const message = await this.propertyService.approveProperty(
      propertyId,
      adminUserId,
      userAgent,
      ipAddress
    );

    return ApiResponse.success(res, null, message);
  };

  public addUnit = async (req: Request, res: Response): Promise<Response> => {
    const propertyId = parseInt(req.params.propertyId as string, 10);
    const requestorUserId = req.user!.userId;
    const requestorRole = req.user!.roleName;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const unitId = await this.propertyService.addUnit(
      propertyId,
      requestorUserId,
      requestorRole,
      req.body,
      userAgent,
      ipAddress
    );

    return ApiResponse.created(res, { unitId }, "Unit added successfully.");
  };

  public updateUnit = async (req: Request, res: Response): Promise<Response> => {
    const unitId = parseInt(req.params.unitId as string, 10);
    const requestorUserId = req.user!.userId;
    const requestorRole = req.user!.roleName;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    await this.propertyService.updateUnit(
      unitId,
      requestorUserId,
      requestorRole,
      req.body,
      userAgent,
      ipAddress
    );

    return ApiResponse.success(res, null, "Unit updated successfully.");
  };

  public uploadMedia = async (req: Request, res: Response): Promise<Response> => {
    const propertyId = parseInt(req.params.propertyId as string, 10);
    const requestorUserId = req.user!.userId;
    const requestorRole = req.user!.roleName;
    const file = req.file;

    if (!file) {
      return ApiResponse.failure(res, "NO_FILE_PROVIDED", "No media file uploaded.", 400);
    }

    const mediaUrl = `/uploads/${file.filename}`;
    const mediaId = await this.propertyService.addMedia(
      propertyId,
      requestorUserId,
      requestorRole,
      mediaUrl,
      "IMAGE",
      req.body.unitId ? parseInt(req.body.unitId, 10) : undefined,
      req.body.isPrimary === "true",
      req.body.caption
    );

    return ApiResponse.created(res, { mediaId, mediaUrl }, "Media uploaded successfully.");
  };

  public favoriteUnit = async (req: Request, res: Response): Promise<Response> => {
    const unitId = parseInt(req.params.unitId as string, 10);
    const userId = req.user!.userId;

    await this.propertyService.toggleFavorite(userId, unitId, "add");
    return ApiResponse.success(res, null, "Unit added to favorites.");
  };

  public unfavoriteUnit = async (req: Request, res: Response): Promise<Response> => {
    const unitId = parseInt(req.params.unitId as string, 10);
    const userId = req.user!.userId;

    await this.propertyService.toggleFavorite(userId, unitId, "remove");
    return ApiResponse.success(res, null, "Unit removed from favorites.");
  };

  public getUserFavorites = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.userId;
    const favorites = await this.propertyService.getUserFavorites(userId);
    return ApiResponse.success(res, favorites, "User favorite units retrieved.");
  };

  public submitReview = async (req: Request, res: Response): Promise<Response> => {
    const reviewerId = req.user!.userId;
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip;

    const message = await this.propertyService.submitReview(
      reviewerId,
      req.body,
      userAgent,
      ipAddress
    );

    return ApiResponse.created(res, null, message);
  };

  public getPropertyReviews = async (req: Request, res: Response): Promise<Response> => {
    const propertyId = parseInt(req.params.propertyId as string, 10);
    const reviews = await this.propertyService.getPropertyReviews(propertyId);
    return ApiResponse.success(res, reviews, "Property reviews retrieved successfully.");
  };
}
