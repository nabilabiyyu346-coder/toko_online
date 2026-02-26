require('dotenv').config();
const { Pool } = require('pg');

console.log('DEBUG ENV:', {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '✅ loaded' : '❌ MISSING',
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

pool.connect()
  .then(() => console.log('✅ PostgreSQL Connected!'))
  .catch(err => console.error('❌ Database connection error:', err));

module.exports = pool;
