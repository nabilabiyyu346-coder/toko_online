// products_fixed.js
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authenticateToken = require('../middleware/authorization');
const authorizeRoles = require('../middleware/roleMiddleware');

// GET all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.product_id, p.name, p.price, p.stock, p.description,
             p.image_url, c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      ORDER BY p.product_id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST product (admin)
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { category_id, name, price, stock, description, image_url } = req.body;

  if (!name || !price || !stock || !category_id)
    return res.status(400).json({ message: 'Input tidak lengkap' });

  const categoryCheck = await pool.query('SELECT * FROM categories WHERE category_id = $1', [category_id]);
  if (categoryCheck.rows.length === 0)
    return res.status(400).json({ message: 'Kategori tidak ditemukan' });

  try {
    const result = await pool.query(
      `INSERT INTO products (category_id, name, price, stock, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [category_id, name, price, stock, description, image_url]
    );
    res.json({ message: 'Produk berhasil ditambahkan', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET product by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT p.product_id, p.name, p.price, p.stock, p.description,
             p.image_url, c.name AS category_name
      FROM products p
      JOIN categories c ON p.category_id = c.category_id
      WHERE p.product_id = $1
    `, [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Produk tidak ditemukan' });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT product update (admin)
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  const { name, price, stock, description, image_url, category_id } = req.body;

  if (!name || !price || !stock || !category_id)
    return res.status(400).json({ message: 'Input tidak lengkap' });

  const categoryCheck = await pool.query('SELECT * FROM categories WHERE category_id = $1', [category_id]);
  if (categoryCheck.rows.length === 0)
    return res.status(400).json({ message: 'Kategori tidak ditemukan' });

  try {
    const result = await pool.query(
      `UPDATE products
       SET name = $1, price = $2, stock = $3, description = $4, image_url = $5, category_id = $6
       WHERE product_id = $7 RETURNING *`,
      [name, price, stock, description, image_url, category_id, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Produk tidak ditemukan' });

    res.json({ message: 'Produk berhasil diperbarui', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE product (admin)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM products WHERE product_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Produk tidak ditemukan' });

    res.json({ message: 'Produk berhasil dihapus', deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;