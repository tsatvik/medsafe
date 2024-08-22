import express from 'express';
import { verifyToken } from '../security/token.js';
import getConnection from '../database/db.js';

const router = express.Router();

router.post('/', verifyToken, async (req, res, next) => {
  let db = null;
  try {
    if (req.userId) {
      db = await getConnection();
      const sql = 'DELETE FROM medsafe_db.Tokens WHERE user_id = ?';
      await db.query(sql, [req.userId]);
    }
  
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });
  
    res.status(200).send('Logged out successfully.');
  } 
  catch (err) {
    return next({message: JSON.stringify(err)});
  }
  finally{
    if (db) {
      db.release(); // Release the connection back to the pool
    }
  }
});

export default router;
