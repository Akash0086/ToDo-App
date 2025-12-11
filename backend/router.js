import express from 'express';
import {db} from './db/connection.js';
import errorHandler  from './middleware/errorHandling.js';
import validate from './middleware/validation.js';
import getTodoSchema from './middleware/validationSchema/getSchema.js';
import postTodoSchema from './middleware/validationSchema/postSchema.js';
import putTodoSchema from './middleware/validationSchema/updateSchema.js';
import deleteTodoSchema from './middleware/validationSchema/deleteSchema.js';
import asyncHandler from './middleware/asyncHandler.js';

const router=express.Router();

router.get('/',validate(getTodoSchema,"query"),asyncHandler(async (req,res)=>{
    let{
      page=1,
      limit=5,
      category,
      search,
      created_at,
      sortBy="status:DESC"
    }=req.query;

    page=parseInt(page);
    limit=parseInt(limit);

    if(isNaN(page) || isNaN(limit) || page<1 || limit<1){
      return next({ message: "Invalid pagination parameters", statusCode: 400 });
    };
    
    const validSortedField=['category','status','created_at'];
    let sortField='status',sortOrder='DESC';
    if(sortBy){
      const [field,order]=sortBy.split(':');
      if(!validSortedField.includes(field.toLowerCase()) ||
       !['ASC','DESC'].includes(order.toUpperCase())){
        return next({
        message: "Invalid sortBy format. Use created_at:desc or status:asc",
        statusCode: 400
      });
      }
       sortField=field.toLowerCase();sortOrder=order.toUpperCase();
    }

    let conditions=[];
    let params=[];

    if(category){
      conditions.push("category = ?");
      params.push(category);
    }

    if(created_at){
      conditions.push("DATE(created_at) = ?");
      params.push(created_at);
    }

    if(search){
      conditions.push("LOWER(task) LIKE ?");
      params.push(`%${search.trim().toLowerCase()}%`);
    };

    const whereStat = conditions.length > 0 ? 
    "WHERE " + conditions.join(" AND ") : "";

    const offset=(page-1)*limit;
    const [rows]=await db.query(
      `select * from todos ${whereStat} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
      [...params,limit,offset]
    );

    //Get total count for pagination metadata
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM todos ${whereStat}`,
      params
    );

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  
}));

router.post('/',validate(postTodoSchema,"body"),async (req,res,next)=>{
  let {task,category,status}=req.body;
  //console.log("TODO Route → req.user:", req.user);
  const {id}=req.user;
  try{
  
  if(!status) status = "pending";

  const customId = `task${Date.now()}`;

  await db.query(
    "insert into todos (id,task,category,status,userId) values (?,?,?,?,?)",
    [customId,task,category,status,id]
  );

  res.status(201).json({
      id: customId,
      task,
      category,
      status
    });
  }catch(err){
    console.error(err.message);
    next(err);
  }
});

router.put('/:id',validate(putTodoSchema,"params"),async (req,res,next)=>{
  const {id}=req.params;
  const {status}=req.body;

  if(!taskId) return next({
    message:"task Id is required to update",statusCode:400
  });
  try{
    const [result]=await db.query(
      "update todos set status=? where id=?",
      [status,taskId]
    );

    if(result.affectedRows === 0) {
      return next({ message: "Todo not found",statusCode:404});
    }
    /*const [rows] = await db.query(
      "SELECT * FROM todos WHERE id = ?",
      [taskId]
    );*/

    res.status(200).json({message:"task is successfully updated"});
  }catch(err){
    console.log(err.message);
    next(err);
  }
});

router.delete('/:id',validate(deleteTodoSchema,"params"),async(req,res,next)=>{
  const {id}=req.params;
  try{
    if(!id) return next({
    message:"task ID is required to delete",statusCode:400
  });
  const [result] = await db.query("DELETE FROM todos WHERE id = ?", [id]);

  if(result.affectedRows === 0) {
    return next({message:"Todo not found",statusCode:404 });
  }

  res.status(200).json({ message: "Task deleted successfully" });
  }catch(err){
    console.log(err.message);
    next(err);
  }
});
export default router;