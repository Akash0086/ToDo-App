import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { userPayload } from '../models/userPayload';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

dotenv.config({path:path.join(__dirname,'../.env')});

const ACCESS_TOKEN=process.env.ACCESS_TOKEN!;
const REFRESH_TOKEN=process.env.REFRESH_TOKEN!;



export const generateAccessToken=(user:userPayload)=>{
  return jwt.sign({
    id:user.id,
    username:user.username,
    role:user.role || 'user',
  },
  ACCESS_TOKEN,
  {expiresIn:'60m'}
);
}

export const generateRefreshToken=(user:userPayload)=>{
  return jwt.sign({
    id:user.id,
  },
  REFRESH_TOKEN,
  {expiresIn:'7d'}
);
}

export const verifyAccessToken=(token:string)=>{
  return jwt.verify(token,ACCESS_TOKEN) as userPayload;;
}

export const verifyRefreshToken=(token:string)=>{
  return jwt.verify(token,REFRESH_TOKEN) as userPayload;;
}
