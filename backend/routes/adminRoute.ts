import { Request,Response } from 'express';
import express from 'express';
import {db} from '../db/connection';
import asyncHandler from '../middleware/asyncHandler';
import {authorizeRole} from '../middleware/authorizeRole';
import { verifyToken } from '../utils/tokenValidation';

const router= express.Router();

router.get(
  "/",
  verifyToken,
  authorizeRole("admin"),
  asyncHandler(async (req, res) => {
    const [users] = await db.query("SELECT id, email, role FROM users");

    res.json({
      success: true,
      data: users,
    });
  })
);

export default router;