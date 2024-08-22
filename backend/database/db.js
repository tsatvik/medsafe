import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config({ path: '../.env' });

const pool = mysql.createPool({
  host: process.env.YOUR_HOST,
  user: process.env.YOUR_USER,
  password: process.env.YOUR_PASSWORD,
  database: process.env.YOUR_DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const getConnection = async () => {
  return await pool.getConnection();
};

export default getConnection;