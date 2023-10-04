import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let db;

export const getConnection = async () => {
  if (!db) {
    try {
      db = await mysql.createConnection({
        host: process.env.YOUR_HOST,
        user: process.env.YOUR_USER,
        password: process.env.YOUR_PASSWORD,
        database: process.env.YOUR_DB
      });
      console.log('Connected to MySQL');
    } catch (err) {
      console.error('Could not connect to MySQL:', err);
      process.exit(1);
    }
  }
  return db;
};
