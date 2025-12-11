import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction)=>{
  console.log(err.stack);
  const status=err.statusCode||500;

  res.status(status).json({
    success:false,
    message:err.message||"Internal server Error"
  });
};

export default errorHandler;