const { Sequelize } = require('sequelize');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;
const isVercel = process.env.VERCEL === '1';
let sequelize;

if (isVercel || (process.env.NODE_ENV === 'production' && databaseUrl)) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required in production/Vercel environment');
  }
  
  console.log('Using PostgreSQL database (Vercel/Production)');
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
