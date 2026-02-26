// categories_fixed.js
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authenticateToken = require('../middleware/authorization');
const authorizeRoles = require('../middleware/roleMiddleware');

// GET all categories
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM categories ORDER BY category_id ASC');
  res.json(result.rows);
});

// POST (admin)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Nama kategori wajib diisi' });

  try {
    await pool.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2)',
      [name, description]
    );
    res.json({ message: 'Kategori ditambahkan' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET category by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM categories WHERE category_id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT (admin)
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Nama kategori wajib diisi' });

  try {
    const result = await pool.query(
      'UPDATE categories SET name = $1, description = $2 WHERE category_id = $3 RETURNING *',
      [name, description, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    res.json({ message: 'Kategori berhasil diperbarui', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (admin)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM categories WHERE category_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    res.json({ message: 'Kategori berhasil dihapus', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;