import express,{Request,Response,NextFunction} from 'express';
import {db} from '../db/connection';
import { generateAccessToken } from '../utils/jwtToken.js';
import { generateRefreshToken } from '../utils/jwtToken.js';
import validate from '../middleware/validation.js';
import loginSchema from '../middleware/validationSchema/loginSchema.js';
import {comparePassword} from '../utils/hashPassword.js';
import logger from '../utils/logger';

const router=express.Router();

router.post("/",validate(loginSchema,"body"),async (req:Request,res:Response,next:NextFunction)=>{
  const {email,password}=req.body;

  if(!email || !password){
    return res.status(401).json({
      error:"email and password are required"
    });
  }
  try{
    let [rows]= await db.query(
      "select id,username,role,email from users where email=?",[email]
    );
    const user=(rows as any)[0];

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    //console.log("User passed into generateAccessToken:", user);

    let [pwdRows] = await db.query(
      "select password from users where email=?",[email]);
      const pwdRow = (pwdRows as any)[0];

    const isMatch=await comparePassword(password,pwdRow.password)
    if(!isMatch){
      return res.status(401).json({
        error:"Incorrect passwords!"
      });
    }
    console.log(user);

    const accessToken=generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refresh_token',refreshToken,{
      httpOnly:true,
      secure:process.env.NODE_ENV === 'production',
      sameSite:'lax',
      maxAge:30 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    logger.info("User logged in", {
      userId: user.id,
      username: user.username,
      ip: req.ip,
    });
    
    return res.json({
      accessToken,
      //refreshToken
      user: { id: user.id, username: user.username ,email:user.email }
    });
  }catch(err:any){
      console.error(err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
});
export default router;