import express from 'express';
import bcrypt from 'bcrypt';
import { decrypt } from '../security/encryption.js'; // Adjust the path according to your file structure
import { handleTokenGeneration } from '../security/session.js'; // Import the function
import getConnection from '../database/db.js'; // Adjust the path according to your file structure

const router = express.Router();

router.post('/', async (req, res, next) => {
  let db = null;
  try {
    db = await getConnection();
    const { email, password } = req.body;

    const [users] = await db.query('SELECT * FROM medsafe_db.Users');
    const user = users.find(u => decrypt(u.email) === email);

    if (!user) {
      return res.status(401).send('Unauthorized: Invalid email');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send('Unauthorized: Invalid password');
    }

    // Assuming handleTokenGeneration creates and sends the token
    await handleTokenGeneration(user.user_id, res);
    res.status(200).send('Login successful');
  } 
  catch (err) {
    console.error(`An error occurred: ${err}`);
    res.status(500).send('Internal server error');
  }
  finally{
    if (db) {
      db.release(); // Release the connection back to the pool
    }
  }
});

export default router;
