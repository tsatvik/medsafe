import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import https from 'https';
import apiLimiter from './utils/rateLimiter.js';
import helmetSecurity from './utils/helmetSecurity.js';
import { errorHandler } from './utils/errorHandler.js';
import signupRouter from './routes/signup.js';
import loginRouter from './routes/login.js';
import portalRouter from './routes/portal.js';
import refreshTokenRouter from './routes/refreshToken.js';
import logoutRouter from './routes/logout.js';
import sessionRouter from './routes/session.js';
import firebaseRouter from './routes/firebase.js';
import profileManagementRouter from './routes/profileManagement.js';
import profileCheckRouter from './routes/profileCheck.js';
import medicalRecordsRouter from './routes/medicalRecords.js';

// Validate environment variables
const port = process.env.YOUR_PORT || 3001;
if (!process.env.YOUR_PORT) {
  console.error("Port number is not set.");
  process.exit(1);
}

// Initialize Express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Middleware
app.use(helmetSecurity);
app.use(cors({
  origin: 'https://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(apiLimiter);

// SSL Certificate
const privateKey = fs.readFileSync('../localhost-key.pem', 'utf8');
const certificate = fs.readFileSync('../localhost.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Routes
app.use('/signup', signupRouter);
app.use('/login', loginRouter);
app.use('/portal', portalRouter);
app.use('/logout', logoutRouter);
app.use('/session', sessionRouter);
app.use('/firebase', firebaseRouter);
app.use('/profile-management', profileManagementRouter);
app.use('/profile-check', profileCheckRouter);
app.use('/refreshToken', refreshTokenRouter);
app.use('/medical-records', medicalRecordsRouter);

// Error handler
app.use(errorHandler());

// Starting HTTPS server
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
  console.log(`HTTPS Server running at https://localhost:${port}/`);
});