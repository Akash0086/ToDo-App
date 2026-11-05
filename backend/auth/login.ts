import express, { Request, Response, NextFunction } from 'express';
import { db } from '../db/connection.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwtToken.js';
import validate from '../middleware/validation.js';
import loginSchema from '../middleware/validationSchema/loginSchema.js';
import { comparePassword } from '../utils/hashPassword.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: user@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: MySecurePass123
 *           minLength: 8
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             username:
 *               type: string
 *               example: johndoe
 *             email:
 *               type: string
 *               format: email
 *               example: user@example.com
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Incorrect password!
 *
 *   securitySchemes:
 *     cookieAuth:                  # Used later for /refresh and protected routes
 *       type: apiKey
 *       in: cookie
 *       name: refresh_token
 *
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints (login, refresh, etc.)
 *
 * /auth/login:
 *   post:
 *     summary: Authenticate user and get access token
 *     description: |
 *       Validates email/password.
 *       On success:
 *       - Returns short-lived **accessToken** in body (use in Authorization: Bearer header)
 *       - Sets httpOnly **refresh_token** cookie (automatically sent on future /auth/refresh calls)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *             description: httpOnly refresh_token cookie (not visible in JavaScript)
 *             example: refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Path=/; Max-Age=2592000; SameSite=Lax
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Authentication failed (user not found or wrong password)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               userNotFound:
 *                 value:
 *                   error: User not found
 *               wrongPassword:
 *                 value:
 *                   error: Incorrect passwords!
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Internal server error
 */
router.post(
  '/',
  validate(loginSchema, 'body'),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // This check is probably redundant because validate(loginSchema) already enforces it
    // but keeping it doesn't hurt
    if (!email || !password) {
      return res.status(401).json({
        error: 'email and password are required',
      });
    }

    try {
      let [rows] = await db.query(
        'SELECT id, username, role, email FROM users WHERE email = ?',
        [email]
      );
      const user = (rows as any[])[0];

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      let [pwdRows] = await db.query(
        'SELECT password FROM users WHERE email = ?',
        [email]
      );
      const pwdRow = (pwdRows as any[])[0];

      const isMatch = await comparePassword(password, pwdRow.password);
      if (!isMatch) {
        return res.status(401).json({
          error: 'Incorrect passwords!',
        });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
      });

      logger.info('User logged in', {
        userId: user.id,
        username: user.username,
        ip: req.ip,
      });

      return res.json({
        accessToken,
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;