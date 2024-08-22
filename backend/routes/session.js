import express from 'express';
import { verifyToken } from '../security/token.js';
const router = express.Router();

router.get('/check-session', verifyToken, (req, res) => {
  if (req.isAuthenticated) {
    res.status(200).json({ isAuthenticated: true, message: 'Session is active' });
  } 
  else {
    res.status(200).json({ isAuthenticated: false, message: 'Session is not active' });
  }
});
  
// Endpoint to get user_id
router.get('/get-user-id', verifyToken, (req, res) => {
  if (req.isAuthenticated) {
    res.status(200).json({ userId: req.userId });
  } 
  else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

export default router;
