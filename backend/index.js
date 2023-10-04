import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { getConnection } from './db.js';
import bcrypt from 'bcrypt';
import { check, validationResult, body } from 'express-validator';
import countries from './countries.js';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import https from 'https';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import helmet from 'helmet';
import crypto from 'crypto';
import dotenv from 'dotenv';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

dotenv.config();

const port = process.env.YOUR_PORT || 3001;
const YOUR_SECRET_KEY = process.env.YOUR_SECRET_KEY || 'defaultSecretKey';
if (!process.env.YOUR_PORT || !process.env.YOUR_SECRET_KEY) {
  console.error("Environment variables are not set.");
  process.exit(1);
}

const app = express();

// Winston Logger Configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

function safeStringify(obj) {
  const seen = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  });
}

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Function to sanitize HTML
const sanitize = (html) => {
  return DOMPurify.sanitize(html);
};

const errorHandler = () => {
  return async function(err, req, res, next) {
    console.log("Next middleware triggered", safeStringify(arguments));
    console.error("Unhandled error:", err);
    const { rollbackDb = false, status = 500, message = 'An unexpected error occurred. Please try again later.' } = err;
    
    // Get the database connection
    const db = await getConnection();
    
    if (rollbackDb && db) {
      try {
        await db.rollback();
      } catch (rollbackErr) {
        logger.error("An error occurred during database rollback: " + sanitize(rollbackErr));
      }
    }
    logger.error("An error occurred: " + sanitize(err));
    res.status(status).json({ error: message });
  };
};

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

app.set('trust proxy', 1);  // Add this line
app.use('/', apiLimiter);
app.use(helmet()); // Basic Security
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: 'https://localhost:3000',
  credentials: true
}));

// SSL Certificate
const privateKey = fs.readFileSync('../localhost-key.pem', 'utf8');
const certificate = fs.readFileSync('../localhost.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Additional encryption function
const encrypt = (text) => {
  
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.YOUR_SECRET_KEY, 'salt', 32);
  const iv = crypto.randomBytes(12); // 12 bytes is standard for GCM
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag().toString('hex'); // Get the GCM tag
  return `${iv.toString('hex')}:${tag}:${encrypted}`;
};

// Decryption function
const decrypt = (text) => {

  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.YOUR_SECRET_KEY, 'salt', 32);
  
  const [iv, tag, encryptedText] = text.split(':');
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex')); // Set the GCM tag for verification
  
  let decrypted = decipher.update(Buffer.from(encryptedText, 'hex'), 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Generate encrypted token
const generateEncryptedToken = (payload, secret, options) => {
  const token = jwt.sign(payload, secret, options);
  return encrypt(token);
};

const verifyToken = (req, res, next) => {
  const encryptedToken = req.cookies.token;

  if (!encryptedToken) {
    req.isAuthenticated = false;
    return next();
  }

  try {
    const token = decrypt(encryptedToken);

    jwt.verify(token, YOUR_SECRET_KEY, (err, decoded) => {
      if (err) {
        console.log("JWT Verification Error:", err);
        req.isAuthenticated = false;
        return next();
      }
      req.userId = decoded.userId;
      req.isAuthenticated = true;
      next();
    });
  } 
  catch (err) {
    console.log("Catch Block Error:", err);
    req.isAuthenticated = false;
    return next();
  }
};


// Generate an encrypted session ID
const generateSessionId = () => {
  const sessionId = crypto.randomBytes(16).toString('hex');
  return encrypt(sessionId);  // Encrypt the session ID before returning
};

const handleTokenGeneration = async (userId, res) => {
  try {

    const db = await getConnection();
    const sessionId = generateSessionId();

    const encryptedToken = generateEncryptedToken({ userId, sessionId }, YOUR_SECRET_KEY, { expiresIn: '1h' });
    const encryptedRefreshToken = generateEncryptedToken({ userId, sessionId }, YOUR_SECRET_KEY, { expiresIn: '7d' });

    // Generate expires_at date: current date + 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.query('INSERT INTO mydb.Tokens (refresh_token, expires_at, created_at, updated_at, user_id) VALUES (?, ?, NOW(), NOW(), ?)', [encryptedRefreshToken, expiresAt, userId]);

    res.cookie('token', encryptedToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });
  } 
  catch (error) {
    console.error("An error occurred in handleTokenGeneration:", error);
    throw error; // Re-throw the error so it can be caught by the calling function
  }
};

app.post('/signup', [
  check('username').isAlphanumeric().withMessage('Username should contain only alphabets and numbers'),
  check('username').isLength({ max: 32 }).withMessage('Username must be at most 32 characters long'),
  body('username').escape(),
  check('email').isEmail().withMessage('Invalid email'),
  check('email').isLength({ max: 64 }).withMessage('Email must be at most 64 characters long'),
  body('email').escape(),
  check('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
  body('phoneNumber').escape(),
  check('password').isLength({ min: 8, max: 64 }).withMessage('Password must between 8 and 64 characters long'),
  body('password').escape(),
  check('firstName').isAlpha().withMessage('First Name should contain only alphabets'),
  check('firstName').isLength({ max: 32 }).withMessage('First Name must be at most 32 characters long'),
  body('firstName').escape(),
  check('lastName').isAlpha().withMessage('Last Name should contain only alphabets'),
  check('lastName').isLength({ max: 32 }).withMessage('Last Name must be at most 32 characters long'),
  body('lastName').escape(),
  check('dob').isISO8601().withMessage('Invalid date of birth'),
  body('dob').escape(),
  check('gender').isIn(['M', 'F']).withMessage('Invalid gender'),
  body('gender').escape(),
  check('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood type'),
  body('bloodType').escape(),
  check('country').isIn(countries).withMessage('Invalid country'),
  body('country').escape(),
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Error details:", errors.array());
    return next({ status: 400, message: 'User creation failed: ' + JSON.stringify(errors.array())});
  }

  let db = null;
  try{
    const { username, email, phoneNumber, password, firstName, lastName, dob, gender, bloodType, country } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Encrypt sensitive data before storing
    const encryptedEmail = encrypt(email);
    const encryptedPhoneNumber = encrypt(phoneNumber);
    const encryptedFirstName = encrypt(firstName);
    const encryptedLastName = encrypt(lastName);
    const encryptedDob = encrypt(dob);
    const encryptedGender = encrypt(gender);
    const encryptedBloodType = encrypt(bloodType);

    const db = await getConnection();
    await db.beginTransaction();

    // Check if username already exists
    const [userRows] = await db.query('SELECT * FROM mydb.Users WHERE username = ?', [username]);
    if (userRows.length > 0) {
      return next({ status: 400, message: 'Username already in use'});
    }

    // Check if email already exists
    const [emailRows] = await db.query('SELECT * FROM mydb.Users WHERE email = ?', [encryptedEmail]);
    if (emailRows.length > 0) {
      return next({ status: 400, message: 'Email already in use'});
    }

    // Check if phone number already exists
    const [phoneRows] = await db.query('SELECT * FROM mydb.Users WHERE phone_num = ?', [encryptedPhoneNumber]);
    if (phoneRows.length > 0) {
      return next({ status: 400, message: 'Phone Number already in use'});
    }

    // Insert user into Users table
    const [userResult] = await db.query('INSERT INTO mydb.Users (username, email, phone_num, password) VALUES (?, ?, ?, ?)', [username, encryptedEmail, encryptedPhoneNumber, hashedPassword]);
    // Get the ID of the newly inserted user
    const userInserted = userResult.insertId;

    // Insert profile into Profiles table
    await db.query('INSERT INTO mydb.Profiles (first_name, last_name, date_of_birth, gender, blood_type, country, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [encryptedFirstName, encryptedLastName, encryptedDob, encryptedGender, encryptedBloodType, country, userResult.insertId]);

    // Commit the transaction
    await db.commit();

    if (userInserted > 0) {
      await handleTokenGeneration(userInserted, res);
      res.status(200).json({ message: 'User created successfully' });
    }
  }
  catch(err) {
    console.error("Error details:", err);
    return next({ rollbackDb: true, message: 'User creation failed'  + JSON.stringify(err)});
  }
});

// Modified /login route
app.post('/login', async (req, res, next) => {
  let db;
  try {
    // Get a connection to the database
    db = await getConnection();

    // Extract username and password from the request body
    const { username, password } = req.body;

    // Query the database to find a user with the given username
    const [rows] = await db.query('SELECT * FROM mydb.Users WHERE username = ?', [username]);

    // Check if a user with the given username exists
    if (rows.length === 0) {
      console.log('No user found with the given username.');
      return next({ rollbackDb: true, status: 401, message: 'Unauthorized: No such username' });
    }

    // Compare the hashed password with the one in the database
    const match = await bcrypt.compare(password, rows[0].password);

    // If the passwords don't match, return unauthorized
    if (!match) {
      console.log('Passwords do not match.');
      return next({ status: 401, message: 'Unauthorized: Incorrect password' });
    }

    // If everything is fine, proceed to generate tokens
    const userId = rows[0].user_id;
    await handleTokenGeneration(userId, res);

    // Send a success response
    res.status(200).send(sanitize('Login successful'));
  }
  catch (err) {
    // Log any errors that occur
    console.error(`An error occurred: ${JSON.stringify(err)}`);
    return next({ status: 401, message: 'Unauthorized: An error occurred ' + JSON.stringify(err) });
  }
});

app.get('/portal', verifyToken, (req, res) => {
  res.json({ data: 'Portal Content' });
});

// Token Renewal Endpoint
app.post('/renew-token', verifyToken, async (req, res, next) => { 
  let db;
  try{
    const db = await getConnection();

    const userId = req.userId; // userId is set by verifyToken middleware
    if (!userId) {
      return next({status: 403, message: 'No valid token provided.'});
    }
    
    // Fetch the existing refresh token from the database
    const sql = 'SELECT * FROM mydb.Tokens WHERE user_id = ?';
    const [rows] = await db.query(sql, [userId]);

    if (rows.length === 0) {
      return next({status: 403, message: 'No existing refresh token found.'});
    }

    // Generate new token and refresh token
    const newToken = jwt.sign({ userId }, YOUR_SECRET_KEY, { expiresIn: '1h' });
    const encryptedNewToken = encrypt(newToken);

    const newRefreshToken = jwt.sign({ userId }, YOUR_SECRET_KEY, { expiresIn: '7d' });
    const encryptedNewRefreshToken = encrypt(newRefreshToken);

    // Update the database with the new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const updateSql = 'UPDATE mydb.Tokens SET refresh_token = ?, expires_at = ?, updated_at = NOW() WHERE user_id = ?';
    await db.query(updateSql, [encryptedNewRefreshToken, expiresAt, userId]);

    // Set the new encrypted token in the cookies
    res.cookie('token', encryptedNewToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });

    res.status(200).send(sanitize('Token renewed successfully.'));
  }
  catch(err){
    return next({message: JSON.stringify(err)});
  }
  
});

app.post('/logout', verifyToken, async (req, res, next) => {
  try {
    if (req.userId) {
      const db = await getConnection();
      const sql = 'DELETE FROM mydb.Tokens WHERE user_id = ?';
      await db.query(sql, [req.userId]);
    }

    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict'
    });

    res.status(200).send(sanitize('Logged out successfully.'));
  } catch (err) {
    return next({message: JSON.stringify(err)});
  }
});


app.get('/check-session', verifyToken, (req, res) => {
  if (req.isAuthenticated) {
    res.status(200).json({ isAuthenticated: true, message: 'Session is active' });
  } else {
    res.status(200).json({ isAuthenticated: false, message: 'Session is not active' });
  }
});

app.use(errorHandler());// Use the error handler

// Starting HTTPS server
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
  console.log(`HTTPS Server running at https://localhost:${port}/`);
});