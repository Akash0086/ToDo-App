import express, { Request, Response, NextFunction } from "express";
import { db } from "./db/connection";
import validate from "./middleware/validation";
import getTodoSchema from "./middleware/validationSchema/getSchema";
import postTodoSchema from "./middleware/validationSchema/postSchema";
import putTodoSchema from "./middleware/validationSchema/updateSchema";
import deleteTodoSchema from "./middleware/validationSchema/deleteSchema";
import asyncHandler from "./middleware/asyncHandler";
import AppError from "./utils/AppError";
import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2";
import logger from "./utils/logger";
import { authorizeRole } from "./middleware/authorizeRole";

const router = express.Router();

// GET
router.get(
  "/",
  validate(getTodoSchema, "query"),
  authorizeRole("user","admin"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const userId = req.user.id;

    const {
      page = "1",
      limit = "5",
      search,
      category,
      status,
      created_at,
      sortBy = "status:DESC",
    } = req.query as Record<string, string>;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    if (pageNum < 1 || limitNum < 1) {
      throw new AppError("Invalid pagination parameters", 400);
    }

    const validSortFields = ["category", "status", "created_at"];
    let sortField = "status";
    let sortOrder: "ASC" | "DESC" = "DESC";

    if (sortBy) {
      const parts = sortBy.split(":");
      const field = parts[0];
      const order = parts[1]?.toUpperCase();

      if (
        !validSortFields.includes(field) ||
        (order && !["ASC", "DESC"].includes(order))
      ) {
        throw new AppError("Invalid sortBy format", 400);
      }

      sortField = field;
      sortOrder = (order as "ASC" | "DESC") || "DESC";
    }

    const sortFieldMap: Record<string, string> = {
      category: "category",
      status: "status",
      created_at: "created_at",
    };

    const conditions: string[] = ["userId = ?"];
    const params: any[] = [req.user.id];

    if (category) {
      conditions.push("category = ?");
      params.push(category.trim());
    }

    if (status) {
      conditions.push("status = ?");
      params.push(status.trim());
    }

    if (created_at) {
      conditions.push("DATE(created_at) = ?");
      params.push(created_at);
    }

    if (search) {
      conditions.push("LOWER(task) LIKE ?");
      params.push(`%${search.toLowerCase()}%`);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;
    const offset = (pageNum - 1) * limitNum;

    const [rows] = await db.query(
      `SELECT * FROM todos
       ${whereClause}
       ORDER BY ${sortFieldMap[sortField]} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    const [countRows] = await db.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM todos ${whereClause}`,
      params
    );

    const total = (countRows[0] as { total: number }).total;

    return res.json({
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  })
);


// POST
router.post(
  "/",
  validate(postTodoSchema, "body"),
  authorizeRole("user","admin"),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError("Unauthorized", 401);

    const { task, category, status } = req.body;
    const userId = req.user.id;

    const finalStatus = status ?? "pending";
    const customId = `task${Date.now()}`;

    await db.query(
      "INSERT INTO todos (id, task, category, status, userId) VALUES (?, ?, ?, ?, ?)",
      [customId, task, category, finalStatus, userId]
    );

    logger.info("Task created", {
      userId: req.user.id,
      taskId: customId,
      category,
    });

    return res.status(201).json({
      id: customId,
      task,
      category,
      status: finalStatus,
    });
    
  })
);

router.put("/:id",
  validate(putTodoSchema,"body"),
  authorizeRole("user","admin"),
  asyncHandler(async(req:Request,res:Response)=>{
    if(!req.user) throw new AppError("unauthorized",401);

    const {id} = req.params;
    const userId=req.user.id;

    const {task,category,status} = req.body;

    const [result]=await db.query<ResultSetHeader>(
      `update todos set task=?, category=?, status=?
      where id=? and userId=?`,
      [task, category, status, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
  }
  
  return res.json({ success: true });
  
  }));

router.delete("/:id",
  validate(deleteTodoSchema, "params"),
  authorizeRole("user","admin"),
  asyncHandler(async (req: Request, res: Response)=>{
    if (!req.user) throw new AppError("Unauthorized", 401);

    const {id} = req.params;
    const userId = req.user.id;
    
    const [result] = await db.query<ResultSetHeader>(
      "delete from todos where id=? and userId=?",
      [id, userId]
    );

    console.log("DELETE params:", { id, userId });

    console.log("Deleting task id:", id);
    
     if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    logger.warn("Task deleted", {
      userId: userId,
      taskId: id,
    });

    return res.json({ success: true });
  })
);
export default router;
