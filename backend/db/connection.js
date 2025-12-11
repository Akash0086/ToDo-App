import mysql from 'mysql2/promise';//mysql2/promise
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);//best practise to use
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
//dotenv.config({ path: path.resolve('./todoAsync/.env') });

console.log('Connecting to MySQL with:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD 
});

export const db=mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});