import express from 'express';
import { verifyToken } from '../security/token.js';

const router = express.Router();

router.get('/', verifyToken, (req, res) => {
  res.json({ data: 'Portal Content' });
});

export default router;
