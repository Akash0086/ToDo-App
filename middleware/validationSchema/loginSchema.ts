import z from 'zod';

const loginSchema=z.object({
  username:z.string().min(2,"username must be two letter"),
  email:z.string().email().optional(),
  password:z.string().min(6,"password must be 6 characters")
});

export default loginSchema;