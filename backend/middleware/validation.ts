import { Request,Response,NextFunction } from "express";
import {  ZodSchema,ZodError } from "zod";

type Location = "body" | "query" | "params";

const validate=(schema:ZodSchema,location: Location = "body")=>
  async(req:Request,res:Response,next:NextFunction)=>{
    try{
      const data = req[location]; // req.body or req.query or req.params

      await schema.parseAsync(data);
      
      next();
    }catch(error){
      if(error instanceof ZodError){
        return res.status(400).json({
          success:"false",
          message:"validation failed",
          errors:error.issues.map((e)=>({
            field:e.path.join('.'),
            message:e.message,
          })),
        });
      }
      next(error);
    }
  };

  export default validate;