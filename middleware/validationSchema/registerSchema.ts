import z from 'zod';

const registerSchema=z.object({
  username:z.string().min(2,"username must be two letter"),
  email:z.email(),
  password:z.string().min(6,"password must be 6 characters")
});

export default registerSchema;