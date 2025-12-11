import {z} from "zod";

export const putTodoSchema=z.object({
  id:z.coerce.number(),
  status:z.enum(["pending","completed"])
});

export default putTodoSchema;