import {z} from 'zod';

const getTodoSchema=z.object({
  id:z.coerce.number().optional(),
  page:z.coerce.number().optional(),
  limit:z.coerce.number().optional(),
  task:z.string().optional(),
  category:z.string().min(2).optional(),
  status:z.enum(["pending","completed"]).optional(),
  search:z.string().optional()

});

export default getTodoSchema;