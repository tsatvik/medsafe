import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import express from 'express';
import { decrypt, encrypt } from '../security/encryption.js';
import getConnection from '../database/db.js';

dotenv.config({ path: '../.env' });
const router = express.Router();

router.post('/', async (req, res) => {
  let db = null;
  try {
    const encryptedRefreshToken = req.cookies.refreshToken;
    if (!encryptedRefreshToken) {
      return res.status(401).send('No refresh token provided');
    }

    const refreshToken = decrypt(encryptedRefreshToken);
    db = await getConnection();

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.YOUR_SECRET_KEY);
    } catch (err) {
      return res.status(403).send('Invalid refresh token');
    }

    const userId = decoded.userId;

    // Check if refresh token is in the database
    const [rows] = await db.query('SELECT * FROM medsafe_db.Tokens WHERE user_id = ?', [userId]);
    if (rows.length === 0 || rows[0].refresh_token !== encryptedRefreshToken) {
      return res.status(403).send('Invalid refresh token');
    }

    // Generate new access and refresh tokens
    const newAccessToken = jwt.sign({ userId }, process.env.YOUR_SECRET_KEY, { expiresIn: '1h' });
    const newRefreshToken = jwt.sign({ userId }, process.env.YOUR_SECRET_KEY, { expiresIn: '7d' });
    const encryptedNewAccessToken = encrypt(newAccessToken);
    const encryptedNewRefreshToken = encrypt(newRefreshToken);

    // Update the refresh token in the database
    await db.query('UPDATE medsafe_db.Tokens SET refresh_token = ?, updated_at = NOW() WHERE user_id = ?', [encryptedNewRefreshToken, userId]);

    // Send new tokens to client
    res.cookie('token', encryptedNewAccessToken, { httpOnly: true, secure: true, sameSite: 'strict' });
    res.cookie('refreshToken', encryptedNewRefreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });
    res.status(200).send('Tokens refreshed successfully.');
  } 
  catch (error) {
    console.error('Error refreshing tokens:', error);
    res.status(500).send('Internal Server Error');
  } 
  finally {
    if (db) {
      db.release();
    }
  }
});

export default router;
