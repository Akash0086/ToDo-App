import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname,'../.env' )});

const SALT_ROUNDS=Number(process.env.SALT_ROUNDS||'12');

//console.log('SALT_ROUNDS =', SALT_ROUNDS);

export const hashPassword = async (plainPassword: string): Promise<string> => {
  console.log('→ bcrypt hashing...');
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
