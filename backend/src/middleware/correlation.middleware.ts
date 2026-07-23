import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export const correlationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const headerName = "X-Request-ID";
  const correlationId = (req.headers[headerName.toLowerCase()] as string) || uuidv4();
  req.correlationId = correlationId;
  res.setHeader(headerName, correlationId);
  next();
};
