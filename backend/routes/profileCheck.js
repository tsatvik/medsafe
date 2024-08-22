import express from 'express';
import getConnection from '../database/db.js';
import { verifyToken } from '../security/token.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  let db = null;
  try {
    db = await getConnection();
    const [rows] = await db.query('SELECT * FROM Profiles WHERE user_id = ?', [req.userId]);
    const hasProfile = rows.length > 0;
    res.json({ hasProfile });
  } 
  catch (err) {
    console.error('Error checking profile:', err);
    res.status(500).json({ message: 'Error checking profile' });
  }
  finally{
    if (db) {
      db.release(); // Release the connection back to the pool
    }
  }
});

export default router;
