const { Sequelize } = require('sequelize');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;
const isVercel = process.env.VERCEL === '1';
let sequelize;

if (isVercel || (process.env.NODE_ENV === 'production' && databaseUrl)) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is missing in production/Vercel');
  }
  
  console.log('Using PostgreSQL database (Vercel/Production)');
  // Log a masked version of the URL to verify it's present in the logs
  console.log(`Connection string prefix: ${databaseUrl.substring(0, 15)}...`);
  
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else {
  console.log('Using SQLite database (Local Development)');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
  });
}

module.exports = sequelize;
