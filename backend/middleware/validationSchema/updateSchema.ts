import {z} from "zod";

export const putTodoSchema=z.object({
  task:z.string().min(3,"Task must be at least 3 characters"),
  category:z.string().min(2),
  status:z.enum(["pending","completed"])
});

export default putTodoSchema;