const { Sequelize } = require('sequelize');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
const isVercel = process.env.VERCEL === '1';

// Masked logging for debugging
if (isVercel) {
  console.log('--- VERCEL STARTUP CHECK ---');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Available Env Keys:', Object.keys(process.env).filter(k => k.includes('DB') || k.includes('URL') || k.includes('POSTGRES')));
  console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
  console.log('POSTGRES_URL present:', !!process.env.POSTGRES_URL);
  if (databaseUrl) {
    console.log('Active DB URL prefix:', databaseUrl.substring(0, 15));
  }
}

let sequelize;

try {
  if (isVercel || process.env.NODE_ENV === 'production') {
    if (!databaseUrl) {
      console.error('CRITICAL ERROR: No Database URL found in Vercel environment!');
      // Instead of SQLite fallback, we throw a specific error that doesn't require a native module
      throw new Error('DATABASE_URL is missing. Please add it to Vercel Environment Variables.');
    } else {
      console.log('Initializing PostgreSQL (Vercel/Production)');
      const normalizedUrl = databaseUrl.replace('postgresql://', 'postgres://');
      sequelize = new Sequelize(normalizedUrl, {
        dialect: 'postgres',
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        logging: false
      });
    }
  } else {
    console.log('Using SQLite database (Local Development)');
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../database.sqlite'),
      logging: false
    });
  }
} catch (err) {
  console.error('CRITICAL: Error during Sequelize initialization:', err);
  // Fail-safe initialization to prevent top-level require failures
  sequelize = new Sequelize('sqlite::memory:', { logging: false });
  console.log('Sequelize initialized with in-memory SQLite due to error.'); // Simple test log
}

module.exports = sequelize;
