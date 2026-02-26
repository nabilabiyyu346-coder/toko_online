const pool = require('../db/pool');

const addToBlacklist = async (token) => {
  await pool.query('INSERT INTO token_blacklist (token) VALUES ($1)', [token]);
};

const isBlacklisted = async (token) => {
  const result = await pool.query(
    'SELECT * FROM token_blacklist WHERE token = $1',
    [token]
  );
  return result.rows.length > 0;
};

module.exports = { addToBlacklist, isBlacklisted };
