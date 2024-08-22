import express from 'express';
import { check, validationResult, body } from 'express-validator';
import getConnection from '../database/db.js';
import { verifyToken } from '../security/token.js';
import { encrypt, decrypt } from '../security/encryption.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  let db = null;
  try {
    db = await getConnection();
    const [rows] = await db.query('SELECT * FROM Profiles WHERE user_id = ?', [req.userId]);

    const profiles = rows.map(row => ({
      profile_id: row.profile_id,
      firstName: row.first_name ? decrypt(row.first_name) : '',
      lastName: row.last_name ? decrypt(row.last_name) : '',
      dob: row.date_of_birth,
      gender: row.gender,
      bloodType: row.blood_type
    }));
    
    res.status(200).json({ profiles });
  } catch (err) {
    console.error("Error fetching profiles:", err);
    res.status(500).json({ message: 'Failed to fetch profiles.' });
  } finally {
    if (db) {
      db.release(); // Release the connection back to the pool
    }
  }
});

router.post('/', verifyToken, [
  // Validation rules here
  check('firstName').isAlpha().withMessage('First Name should contain only alphabets'),
  check('firstName').isLength({ max: 32 }).withMessage('First Name must be at most 32 characters long'),
  body('firstName').escape(),
  check('lastName').isAlpha().withMessage('Last Name should contain only alphabets'),
  check('lastName').isLength({ max: 32 }).withMessage('Last Name must be at most 32 characters long'),
  body('lastName').escape(),
  check('dob').isISO8601().withMessage('Invalid date of birth'),
  body('dob').escape(),
  check('gender').isIn(['M', 'F', 'Other']).withMessage('Invalid gender'),
  body('gender').escape(),
  check('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood type'),
  body('bloodType').escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Profile creation failed: ' + JSON.stringify(errors.array()) });
  }

  let db = null;
  try {
    db = await getConnection();

    await db.beginTransaction();

    const { firstName, lastName, dob, gender, bloodType } = req.body;
    const userId = req.userId; 

    const queryString = 'INSERT INTO Profiles (first_name, last_name, date_of_birth, gender, blood_type, user_id) VALUES (?, ?, ?, ?, ?, ?)';

    const insertResult = await db.query(
      queryString,
      [encrypt(firstName), encrypt(lastName), dob, gender, bloodType, userId]
    );

    if (!insertResult || !insertResult[0] || !insertResult[0].insertId) {
      throw new Error('Insertion failed: No insertId available');
    }

    await db.commit();

    // Fetch the newly created profile
    const [newProfileRows] = await db.query('SELECT * FROM Profiles WHERE profile_id = ?', [insertResult[0].insertId]);

    if (!newProfileRows || newProfileRows.length === 0) {
      throw new Error('Failed to retrieve the newly created profile.');
    }

    const createdProfile = {
      profile_id: newProfileRows[0].profile_id,
      firstName: decrypt(newProfileRows[0].first_name),
      lastName: decrypt(newProfileRows[0].last_name),
      dob: newProfileRows[0].date_of_birth,
      gender: newProfileRows[0].gender,
      bloodType: newProfileRows[0].blood_type
    };

    res.status(201).json({ newProfile: createdProfile });
  } 
  catch (error) {
    console.error('Error during profile creation:', error);

    if (db) {
      await db.rollback();
    }

    res.status(500).json({ message: 'Profile creation failed: ' + error.message });
  } 
  finally {
    if (db) {
      db.release();
    }
  }
});

router.put('/:profileId', verifyToken, [
  check('firstName').isAlpha().withMessage('First Name should contain only alphabets'),
  check('firstName').isLength({ max: 32 }).withMessage('First Name must be at most 32 characters long'),
  body('firstName').escape(),
  check('lastName').isAlpha().withMessage('Last Name should contain only alphabets'),
  check('lastName').isLength({ max: 32 }).withMessage('Last Name must be at most 32 characters long'),
  body('lastName').escape(),
  check('dob').isISO8601().withMessage('Invalid date of birth'),
  body('dob').escape(),
  check('gender').isIn(['M', 'F', 'Other']).withMessage('Invalid gender'),
  body('gender').escape(),
  check('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood type'),
  body('bloodType').escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Profile update failed: ' + JSON.stringify(errors.array()) });
  }

  let db = null;
  try {
    const { firstName, lastName, dob, gender, bloodType } = req.body;

    db = await getConnection();
    await db.beginTransaction();

    await db.query('UPDATE Profiles SET first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, blood_type = ? WHERE profile_id = ? AND user_id = ?', 
    [encrypt(firstName), encrypt(lastName), dob, gender, bloodType, req.params.profileId, req.userId]);

    await db.commit();

    res.status(200).json({ message: 'Profile updated successfully' });
  } 
  catch (err) {
    console.error("Error updating profile:", err);
    if (db) {
      await db.rollback();
    }
    res.status(500).json({ message: 'Profile update failed: ' + JSON.stringify(err) });
  }
  finally{
    if (db) {
      db.release(); // Release the connection back to the pool
    }
  }
});

router.delete('/:profileId', verifyToken, async (req, res) => {
  let db = null;
  try {
    db = await getConnection();
    await db.beginTransaction();

    await db.query('DELETE FROM Profiles WHERE profile_id = ? AND user_id = ?', [req.params.profileId, req.userId]);

    await db.commit();

    res.status(200).json({ message: 'Profile deleted successfully' });
  } 
  catch (err) {
    console.error("Error deleting profile:", err);
    if (db) {
      await db.rollback();
    }
    res.status(500).json({ message: 'Failed to delete profile.' });
  }
  finally{
    if (db) {
      db.release(); // Release the connection back to the pool
    }
  }
});

export default router;