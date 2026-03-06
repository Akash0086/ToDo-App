import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwtToken.js';
import { UserPayload } from '../models/userPayload.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);

dotenv.config({path:path.join(__dirname,'../.env')});

//const ACCESS_TOKEN=process.env.ACCESS_TOKEN!;
const REFRESH_TOKEN=process.env.REFRESH_TOKEN!;

const router = express.Router();

router.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token;
  console.log(req.cookies);


  if (!refreshToken) {
    return res.status(401).json({ error:'No refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN) as UserPayload;
    console.log(decoded);
    console.log("Decoded refresh token:", decoded);

    const [rows] = await db.query(
      'SELECT id, username FROM users WHERE id = ?',
      [decoded.id]
    );

    const user = (rows as any[])[0];

    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user);

    return res.json({ accessToken: newAccessToken });
  } catch (err: any) {
    console.error('Refresh error:', err.message);
    return res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
});

export default router;