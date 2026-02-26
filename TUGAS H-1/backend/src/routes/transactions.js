// transactions_fixed.js
const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authenticateToken = require('../middleware/authorization');
const authorizeRoles = require('../middleware/roleMiddleware');

// GET all transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.transaction_id, t.user_id, u.username, t.total_amount,
             t.payment_method, t.created_at
      FROM transactions t
      JOIN users u ON t.user_id = u.user_id
      ORDER BY t.transaction_id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new transaction (kasir or admin)
router.post('/', authenticateToken, authorizeRoles('kasir', 'admin'), async (req, res) => {
  const client = await pool.connect();

  try {
    const user_id = req.user.user_id; // FIXED: tidak ambil dari body
    const { payment_method, items } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: 'Items tidak boleh kosong' });

    await client.query('BEGIN');
    let total = 0;

    for (const item of items) {
      const { rows } = await client.query('SELECT price, stock FROM products WHERE product_id = $1', [item.product_id]);
      const product = rows[0];

      if (!product) throw new Error('Produk tidak ditemukan');
      if (product.stock < item.quantity) throw new Error('Stok tidak cukup');

      total += product.price * item.quantity;

      await client.query('UPDATE products SET stock = stock - $1 WHERE product_id = $2', [item.quantity, item.product_id]);
    }

    const trans = await client.query(`
      INSERT INTO transactions (user_id, total_amount, payment_method)
      VALUES ($1, $2, $3) RETURNING transaction_id
    `, [user_id, total, payment_method]);

    const transactionId = trans.rows[0].transaction_id;

    for (const item of items) {
      const { rows } = await client.query('SELECT price FROM products WHERE product_id = $1', [item.product_id]);
      const subtotal = rows[0].price * item.quantity;
      await client.query(`
        INSERT INTO transaction_details (transaction_id, product_id, quantity, subtotal)
        VALUES ($1, $2, $3, $4)
      `, [transactionId, item.product_id, item.quantity, subtotal]);
    }

    await client.query('COMMIT');
    res.json({ message: 'Transaksi berhasil', transaction_id: transactionId, total });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET transaction by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const trans = await pool.query(`
      SELECT t.transaction_id, t.user_id, u.username, t.total_amount,
             t.payment_method, t.created_at
      FROM transactions t
      JOIN users u ON t.user_id = u.user_id
      WHERE t.transaction_id = $1
    `, [id]);

    if (trans.rows.length === 0)
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });

    const details = await pool.query(`
      SELECT td.detail_id, td.product_id, p.name, td.quantity, td.subtotal
      FROM transaction_details td
      JOIN products p ON td.product_id = p.product_id
      WHERE td.transaction_id = $1
    `, [id]);

    res.json({
      ...trans.rows[0],
      details: details.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE transaction (admin or kasir)
router.put('/:id', authenticateToken, authorizeRoles('admin', 'kasir'), async (req, res) => {
  const { id } = req.params;
  const { payment_method } = req.body;

  try {
    const result = await pool.query(
      'UPDATE transactions SET payment_method = $1 WHERE transaction_id = $2 RETURNING *',
      [payment_method, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });

    res.json({ message: 'Transaksi berhasil diperbarui', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
