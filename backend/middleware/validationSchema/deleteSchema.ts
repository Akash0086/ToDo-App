import {z} from "zod";

const deleteTodoSchema=z.object({
  id:z.coerce.number()
});

export default deleteTodoSchema;