import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/connection.js';
import { generateAccessToken } from '../utils/jwtToken.js'; // ← removed unused import
import { UserPayload } from '../models/userPayload.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN!;

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints (login, register, token refresh)
 *
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: refresh_token          # ← must match the cookie name you're using
 *
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using httpOnly refresh token cookie
 *     description: |
 *       Uses the httpOnly `refresh_token` cookie sent automatically by the browser.
 *       Returns a new short-lived access token if the refresh token is valid.
 *       No request body is required.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []             # ← tells Swagger UI this endpoint requires the cookie
 *     responses:
 *       200:
 *         description: Successfully issued new access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: No refresh token provided (missing cookie)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No refresh token
 *       403:
 *         description: Invalid, expired, or revoked refresh token / User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid or expired refresh token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as UserPayload;

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