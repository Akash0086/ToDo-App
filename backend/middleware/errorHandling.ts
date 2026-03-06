import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import logger from "../utils/logger";

interface ErrorResponse {
  success: false;
  message: string;
  statusCode?: number;
  errorCode?: string;
  details?: Record<string, any>;
  stack?: string;
  timestamp?: string;
}

/*
  Development error response
*/
const sendErrorDev = (err: AppError, req: Request, res: Response) => {
  logger.error("Development Error", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  const response: ErrorResponse = {
    success: false,
    message: err.message,
    statusCode: err.statusCode,
    errorCode: err.errorCode,
    details: err.details,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  };

  res.status(err.statusCode || 500).json(response);
};

/*
  Production error response
*/
const sendErrorProd = (err: AppError, req: Request, res: Response) => {
  if (err.isOperational) {
    // Log operational errors as warning
    logger.warn("Operational Error", {
      message: err.message,
      statusCode: err.statusCode,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });

    const response: ErrorResponse = {
      success: false,
      message: err.message,
      statusCode: err.statusCode,
      errorCode: err.errorCode,
      details: err.details,
    };

    return res.status(err.statusCode || 500).json(response);
  }

  // Programming / unknown error
  logger.error("Programming Error", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later.",
  });
};

/*
  Global Error Handler
*/
const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let normalizedError: AppError;

  if (err instanceof AppError) {
    normalizedError = err;
  } else {
    normalizedError = new AppError(
      "Internal Server Error",
      500,
      false // programming error
    );
  }

  if (process.env.NODE_ENV !== "production" && err instanceof Error) {
    normalizedError.stack = err.stack;
  }

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(normalizedError, req, res);
  } else {
    sendErrorProd(normalizedError, req, res);
  }
};

export default globalErrorHandler;