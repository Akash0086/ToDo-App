import express,{Request,Response} from 'express';
import {db} from '../db/connection.js';
import validate from '../middleware/validation.js';
import registerSchema from '../middleware/validationSchema/registerSchema.js';
import { hashPassword } from '../utils/hashPassword.js';

const router=express.Router();

router.post("/",validate(registerSchema,"body"),async (req:Request,res:Response)=>{
  const {username,email,password}=req.body;
  try{
    if(!username || !email || !password){
      return res.status(401).json({
        error:"username,email,password are required to register"
      });
    }
    const hashedPassword=await hashPassword(password);
    console.log("Password hashed successfully");

    await db.query(
      "insert into users (username,email,password) values(?,?,?)",
      [username,email,hashedPassword]
    );

    return res.status(201).json({ message: "User registered successfully" });
    
  }catch(err:any){
    console.log(err.message);

    return res.status(500).json({error:"Internal server error"});
  };
});

export default router;
