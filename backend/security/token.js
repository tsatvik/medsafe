import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { encrypt, decrypt } from './encryption.js';

dotenv.config({ path: '../.env' });

// Generate encrypted token
export const generateEncryptedToken = (payload, secret, options) => {
  const token = jwt.sign(payload, secret, options);
  return encrypt(token);
};

export const verifyToken = (req, res, next) => {
  const encryptedToken = req.cookies.token;
  
  if (!encryptedToken) {
    req.isAuthenticated = false;
    return next();
  }

  try {
    const token = decrypt(encryptedToken);
    jwt.verify(token, process.env.YOUR_SECRET_KEY, (err, decoded) => {
      if (err) {
        req.isAuthenticated = false;
        if (err.name === 'TokenExpiredError') {
          req.isTokenExpired = true;
        }
        return next();
      }
      req.userId = decoded.userId;
      req.isAuthenticated = true;
      next();
    });
  } 
  catch (err) {
    console.error("Error verifying token:", err);
    req.isAuthenticated = false;
    return next();
  }
};