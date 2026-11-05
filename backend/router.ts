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

/**
 * @swagger
 * tags:
 *   - name: Todos
 *     description: CRUD operations for authenticated user's todos
 *
 * /todos:
 *   get:
 *     summary: Retrieve paginated list of todos
 *     description: |
 *       Returns the authenticated user's todos with support for:
 *       - Pagination (page, limit)
 *       - Text search on task
 *       - Filtering by category, status, exact created_at date
 *       - Sorting by category/status/created_at (with ASC/DESC)
 *       
 *       All results are scoped to the current user (userId from JWT).
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-based)
 *         required: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 5
 *         description: Items per page
 *         required: false
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Partial text search in task (case-insensitive)
 *         required: false
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Exact category match
 *         required: false
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed]
 *         description: Exact status match
 *         required: false
 *       - in: query
 *         name: created_at
 *         schema:
 *           type: string
 *           format: date
 *           example: 2025-03-13
 *         description: Exact creation date (YYYY-MM-DD)
 *         required: false
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           pattern: '^(category|status|created_at):(ASC|DESC)$'
 *           example: status:DESC
 *         description: Sort format "field:DIRECTION". Default status:DESC
 *         required: false
 *     responses:
 *       200:
 *         description: Paginated todos list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TodoListResponse'
 *       400:
 *         description: Invalid parameters (pagination, sort, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid JWT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden (insufficient role)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   post:
 *     summary: Create a new todo
 *     description: Creates a todo owned by the authenticated user. ID is auto-generated as "task{timestamp}".
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - task
 *               - category
 *             properties:
 *               task:
 *                 type: string
 *                 minLength: 1
 *                 example: Finish project documentation
 *               category:
 *                 type: string
 *                 example: Work
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *                 default: pending
 *                 example: pending
 *     responses:
 *       201:
 *         description: Todo created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *
 * /todos/{id}:
 *   put:
 *     summary: Update a todo
 *     description: Updates fields of an existing todo (partial update allowed). Only the owner can update.
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo custom ID (e.g. task1739456789123)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               task:
 *                 type: string
 *                 example: Updated task description
 *               category:
 *                 type: string
 *                 example: Personal
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed]
 *                 example: completed
 *     responses:
 *       200:
 *         description: Todo updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not owner or insufficient role
 *       404:
 *         description: Todo not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     summary: Delete a todo
 *     description: Deletes a todo if the authenticated user is the owner.
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Todo ID to delete
 *     responses:
 *       200:
 *         description: Todo deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not owner)
 *       404:
 *         description: Todo not found
 */

/**
 * @swagger
 * /todos/health:
 *   get:
 *     summary: Health check for todos router
 *     tags: [Todos]
 *     responses:
 *       200:
 *         description: Server is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */

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


router.get('/health', (req, res) => res.json({ status: 'ok' }));


export default router;
