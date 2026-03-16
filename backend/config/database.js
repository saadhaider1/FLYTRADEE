const { Sequelize } = require('sequelize');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;
const isVercel = process.env.VERCEL === '1';

// Masked logging for debugging
if (isVercel) {
  console.log('--- VERCEL STARTUP CHECK ---');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL present:', !!databaseUrl);
  if (databaseUrl) {
    console.log('DATABASE_URL prefix:', databaseUrl.substring(0, 10));
  }
}

let sequelize;

try {
  if (isVercel || process.env.NODE_ENV === 'production') {
    if (!databaseUrl) {
      console.error('CRITICAL: DATABASE_URL is missing in PRODUCTION/VERCEL environment!');
      // On Vercel, we MUST have a DB. But we fall back to a "safe" mock to prevent module crash.
      // This allows the app to load and serve a 500 with a real error message instead of crashing the process.
      sequelize = new Sequelize('sqlite::memory:', { logging: false });
    } else {
      console.log('Using PostgreSQL database (Vercel/Production)');
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
}

module.exports = sequelize;
