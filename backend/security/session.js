import dotenv from 'dotenv';
import crypto from 'crypto';
import { generateEncryptedToken } from './token.js';
import { encrypt } from './encryption.js';
import getConnection from '../database/db.js';

dotenv.config({ path: '../.env' });

// Generate an encrypted session ID
export const generateSessionId = () => {
  const sessionId = crypto.randomBytes(16).toString('hex');
  return encrypt(sessionId);  
};

export const handleTokenGeneration = async (userId, res) => {
  let db = null;
  try {
    db = await getConnection();
    
    const encryptedAccessToken = generateEncryptedToken({ userId }, process.env.YOUR_SECRET_KEY, { expiresIn: '1h' });
    const encryptedRefreshToken = generateEncryptedToken({ userId }, process.env.YOUR_SECRET_KEY, { expiresIn: '7d' });
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store or update the refresh token in the database
    const upsertSql = `
      INSERT INTO medsafe_db.Tokens (user_id, refresh_token, expires_at, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE refresh_token = ?, expires_at = ?, updated_at = NOW()
    `;
    await db.query(upsertSql, [userId, encryptedRefreshToken, expiresAt, encryptedRefreshToken, expiresAt]);
    
    res.cookie('token', encryptedAccessToken, { httpOnly: true, secure: true, sameSite: 'strict' });
    res.cookie('refreshToken', encryptedRefreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
  } 
  catch (error) {
    console.error("Error in handleTokenGeneration:", error);
    throw error;
  }
  finally{
    if (db) {
      db.release(); // Release the connection back to the pool
    }
  }
};

