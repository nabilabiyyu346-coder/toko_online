// users_fixed.js
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authenticateToken = require('../middleware/authorization');
const authorizeRoles = require('../middleware/roleMiddleware');
const bcrypt = require('bcrypt');

// REGISTER user baru (admin only)
router.post('/register', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { username, password, full_name, role } = req.body;

  if (!username || !password || !full_name || !role)
    return res.status(400).json({ message: 'Input tidak lengkap' });

  const existing = await pool.query('SELECT username FROM users WHERE username = $1', [username]);
  if (existing.rows.length > 0)
    return res.status(400).json({ message: 'Username sudah digunakan' });

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      'INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4)',
      [username, hashedPassword, full_name, role]
    );

    res.json({ message: 'User berhasil dibuat' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DEACTIVATE user (admin)
router.put('/deactivate/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE users SET is_active = FALSE WHERE user_id = $1', [id]);
    res.json({ message: `User ${id} dinonaktifkan` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET profile by ID
router.get('/profile/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT user_id, username, full_name, role, is_active, created_at FROM users WHERE user_id = $1',
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'User tidak ditemukan' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all users (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, username, full_name, role, is_active FROM users ORDER BY user_id ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;