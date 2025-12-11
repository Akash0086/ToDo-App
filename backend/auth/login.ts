import express,{Request,Response,NextFunction} from 'express';
import {db} from '../db/connection.js';
import { generateAccessToken } from '../utils/jwtToken.js';
import { generateRefreshToken } from '../utils/jwtToken.js';
import validate from '../middleware/validation.js';
import loginSchema from '../middleware/validationSchema/loginSchema.js';
import {comparePassword} from '../utils/hashPassword.js';

const router=express.Router();

router.post("/",validate(loginSchema,"body"),async (req:Request,res:Response,next:NextFunction)=>{
  const {username,password}=req.body;

  if(!username || !password){
    return res.status(401).json({
      error:"username and password are required"
    });
  }
  try{
    let [rows]= await db.query(
      "select id,username,role from users where username=?",[username]
    );
    const user=(rows as any)[0];

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    //console.log("User passed into generateAccessToken:", user);

    let [pwdRows] = await db.query(
      "select password from users where username=?",[username]);
      const pwdRow = (pwdRows as any)[0];

    const isMatch=await comparePassword(password,pwdRow.password)
    if(!isMatch){
      return res.status(401).json({
        error:"Incorrect passwords!"
      });
    }
     

    const accessToken=generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      accessToken,
      refreshToken
      //user: { id: user.id, username: user.username }
    });
  }catch(err:any){
      console.error(err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
});
export default router;