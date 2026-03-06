import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import logger from "../utils/logger";

export const authorizeRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    if (!allowedRoles.includes(req.user.role as string)) {
      logger.warn("RBAC violation attempt", {
        userId: req.user.id,
        role: req.user.role,
        route: req.originalUrl,
      });

      return next(
        new AppError("Forbidden: insufficient permissions", 403)
      );
    }

    next();
  };
};