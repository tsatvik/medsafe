// backend/routes/medicalRecords.js
import express from 'express';
import getConnection from '../database/db.js';
import { verifyToken } from '../security/token.js';
import { decrypt } from '../security/encryption.js';

const router = express.Router();

// Endpoint to fetch profiles for a user
router.get('/profiles', verifyToken, async (req, res) => {
  try {
    const db = await getConnection();
    const [profiles] = await db.query('SELECT profile_id, first_name, last_name FROM Profiles WHERE user_id = ?', [req.userId]);
    const decryptedProfiles = profiles.map(profile => ({
      profile_id: profile.profile_id,
      firstName: decrypt(profile.first_name),
      lastName: decrypt(profile.last_name)
    }));
    res.json(decryptedProfiles);
  } 
  catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ message: 'Failed to fetch profiles.' });
  }
});

// Endpoint to fetch medical records for a specific profile
router.get('/:profileId', verifyToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const db = await getConnection();
    const [records] = await db.query('SELECT * FROM MedicalRecords WHERE profile_id = ? LIMIT ? OFFSET ?', 
                                     [req.params.profileId, limit, offset]);
    res.json(records);
  } 
  catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ message: 'Failed to fetch medical records.' });
  }
});

// Endpoint to add a new medical record
router.post('/add', verifyToken, async (req, res) => {
  const { recordType, date, details, profileId } = req.body;

  // Validate input
  if (!recordType || !date || !details || !profileId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const db = await getConnection();

    // Construct the query
    const query = 'INSERT INTO MedicalRecords (record_type, date, record_details, profile_id) VALUES (?, ?, ?, ?)';
    const queryParams = [recordType, date, JSON.stringify(details), profileId];

    // Execute the query
    await db.query(query, queryParams);

    res.status(201).json({ message: 'Record added successfully' });
  } catch (error) {
    console.error('Error adding new record:', error);
    res.status(500).json({ message: 'Failed to add new record.', error: error.message });
  }
});

export default router;
