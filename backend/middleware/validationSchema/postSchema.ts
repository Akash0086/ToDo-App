import {z} from "zod";

const postTodoSchema=z.object({
  task:z.string().min(3,"Task must be at least 3 characters"),
  category:z.string().min(2),
  status:z.enum(["pending","completed"]).optional()

});
export default postTodoSchema;