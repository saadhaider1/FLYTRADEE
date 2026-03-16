const { Sequelize } = require('sequelize');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;
const isVercel = process.env.VERCEL === '1';

// Detailed logging for Vercel debugging
if (isVercel) {
  console.log('--- VERCEL STARTUP CHECK ---');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DATABASE_URL present:', !!databaseUrl);
  if (databaseUrl) {
    console.log('DATABASE_URL protocol:', databaseUrl.split(':')[0]);
  }
  console.log('----------------------------');
}

let sequelize;

try {
  if (isVercel || (process.env.NODE_ENV === 'production' && databaseUrl)) {
    if (!databaseUrl) {
      console.error('ERROR: DATABASE_URL is missing in PRODUCTION/VERCEL');
      sequelize = null;
    } else {
      console.log('Using PostgreSQL database (Vercel/Production)');
      
      // Sequelize/pg sometimes prefers postgres:// over postgresql://
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
  console.error('CRITICAL: Failed to create Sequelize instance:', err);
  sequelize = null;
}

module.exports = sequelize;
