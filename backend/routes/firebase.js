import express from 'express';
import { verifyToken } from '../security/token.js';
import getConnection from '../database/db.js';

const router = express.Router();

router.post('/register', verifyToken, async (req, res) => {
  let db = null;
  try {
    const { userId, token } = req.body;
    if (!userId || !token) {
      return res.status(400).json({ message: 'User ID and token are required' });
    }

    db = await getConnection();
    await db.query('INSERT INTO NotificationIDs (user_id, token) VALUES (?, ?) ON DUPLICATE KEY UPDATE token = ?', [userId, token, token]);
    
    res.json({ message: 'Firebase token registered successfully' });
  } 
  catch (error) {
    console.error('Error in /register:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
  finally{
    if (db) {
      db.release(); // Release the connection back to the pool
    }
  }
});

export default router;
