import {z} from "zod";

const deleteTodoSchema=z.object({
  id:z.string()
});

export default deleteTodoSchema;