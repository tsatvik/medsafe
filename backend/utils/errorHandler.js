import winston from 'winston';
import getConnection from '../database/db.js';
import { sanitize, safeStringify } from './stringUtils.js';

// Winston Logger Configuration
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

export const errorHandler = () => {
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
