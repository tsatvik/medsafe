import express from 'express';
import { check, validationResult, body } from 'express-validator';
import bcrypt from 'bcrypt';
import { encrypt } from '../security/encryption.js';
import getConnection from '../database/db.js';
import { handleTokenGeneration } from '../security/session.js';

const router = express.Router();

router.post('/', [
  check('email').isEmail().withMessage('Invalid email'),
  check('email').isLength({ max: 64 }).withMessage('Email must be at most 64 characters long'),
  body('email').escape(),
  check('password').isLength({ min: 8, max: 64 }).withMessage('Password must between 8 and 64 characters long'),
  body('password').escape()
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Error details:", errors.array());
    return next({ status: 400, message: 'User creation failed: ' + JSON.stringify(errors.array()) });
  }

  let db = null;
  try {
    const { email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Encrypt email before storing
    const encryptedEmail = encrypt(email);

    db = await getConnection();
    await db.beginTransaction();

    // Check if email already exists
    const [emailRows] = await db.query('SELECT * FROM medsafe_db.Users WHERE email = ?', [encryptedEmail]);
    if (emailRows.length > 0) {
      return next({ status: 400, message: 'Email already in use' });
    }

    // Insert user into Users table
    const [userResult] = await db.query('INSERT INTO medsafe_db.Users (email, password) VALUES (?, ?)', [encryptedEmail, hashedPassword]);
    const userId = userResult.insertId;

    // Commit the transaction
    await db.commit();

    if (userId > 0) {
      await handleTokenGeneration(userId, res);
      res.status(200).json({ message: 'User created successfully' });
    }
  } 
  catch (err) {
    console.error("Error details:", err);
    if (db) {
      await db.rollback();
    }
    return next({ status: 500, message: 'User creation failed: ' + JSON.stringify(err) });
  }
  finally{
    if (db) {
      db.release(); // Release the connection back to the pool
    }
  }
});

export default router;