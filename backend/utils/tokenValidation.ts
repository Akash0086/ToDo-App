import {Request,Response,NextFunction} from 'express';
import {verifyAccessToken} from './jwtToken.js';

export const verifyToken=(req:Request,res:Response,next:NextFunction)=>{
  try{
    const authHeader=req.headers.authorization;

    if(!authHeader){
      return res.status(401).json({
        error:"No authorization header provided"
      })
    };
    
    const parts=authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        error: "Invalid authorization format" 
      });
    }

    const token=parts[1];

    const user=verifyAccessToken(token);
    console.log("verifyToken → decoded:", user);
    req.user=user;

    next();
  }catch(err:any){
    console.error("JWT verification error:", err.message);

    return res.status(401).json({
      error: "Invalid or expired token",
    });

  }
}


