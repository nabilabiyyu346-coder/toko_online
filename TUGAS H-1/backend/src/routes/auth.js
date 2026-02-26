const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { addToBlacklist, isBlacklisted } = require('../middleware/tokenBlacklist');
require('dotenv').config();

// === LOGIN ===
router.post('/login', async(req, res) => {
    const { username, password } = req.body;

    try {
        // Cek user di database
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
        if (user.is_active === false) return res.status(403).json({ message: 'Akun dinonaktifkan' });

        // Bandingkan password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Password salah' });

        // Buat access token & refresh token
        const accessToken = jwt.sign({ id: user.user_id, username: user.username, role: user.role },
            process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign({ id: user.user_id },
            process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' }
        );

        // Simpan refresh token di database
        await pool.query('UPDATE users SET refresh_token = $1 WHERE user_id = $2', [refreshToken, user.user_id]);

        // Kirim token ke client
        res.status(200).json({
            message: 'Login berhasil',
            accessToken,
            refreshToken,
            user: {
                id: user.user_id,
                username: user.username,
                full_name: user.full_name,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Terjadi kesalahan di server' });
    }
});


// === REFRESH TOKEN ===
router.post('/refresh', async(req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Token tidak ditemukan' });

    try {
        // Cek blacklist
        const blacklisted = await isBlacklisted(refreshToken);
        if (blacklisted) return res.status(403).json({ message: 'Refresh token invalid atau sudah kadaluarsa, silahkan login ulang' });

        const result = await pool.query('SELECT * FROM users WHERE refresh_token = $1', [refreshToken]);
        const user = result.rows[0];
        if (!user) return res.status(403).json({ message: 'Refresh token invalid atau sudah kadaluarsa, silahkan login ulang' });

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Refresh token invalid atau sudah kadaluarsa, silahkan login ulang' });

            // Generate refresh token baru (rotation)
            const newRefreshToken = jwt.sign({ id: user.user_id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
            const newAccessToken = jwt.sign({ id: user.user_id, username: user.username, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

            try {
                // Blacklist refresh token lama
                await addToBlacklist(refreshToken);

                // Simpan refresh token baru di DB
                await pool.query('UPDATE users SET refresh_token = $1 WHERE user_id = $2', [newRefreshToken, user.user_id]);

                res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
            } catch (err) {
                console.error('Error during token rotation:', err.message);
                res.status(500).json({ error: 'Terjadi kesalahan server saat merotasi token' });
            }
        });
    } catch (err) {
        console.error('Error in refresh endpoint:', err.message);
        res.status(500).json({ error: err.message });
    }
});


// === LOGOUT ===
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  const authHeader = req.headers['authorization'];

  if (!refreshToken) return res.status(400).json({ message: 'Refresh token wajib dikirim' });
  if (!authHeader) return res.status(401).json({ message: 'Access token wajib dikirim' });

  const accessToken = authHeader.split(' ')[1];

  try {
    // Verifikasi access token untuk tahu siapa yang logout
    const decodedAccess = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // Cek refresh token di database
    const result = await pool.query('SELECT * FROM users WHERE refresh_token = $1', [refreshToken]);
    const user = result.rows[0];

    if (!user) return res.status(403).json({ message: 'Refresh token tidak valid' });

    // Pastikan user di access token = user di refresh token
    if (decodedAccess.id !== user.user_id) {
      return res.status(403).json({ message: 'Token tidak sesuai dengan user yang login' });
    }

    // Masukkan ke blacklist (opsional, tapi direkomendasikan)
    await pool.query('INSERT INTO token_blacklist (token) VALUES ($1)', [refreshToken]);

    // Hapus refresh token di tabel user
    await pool.query('UPDATE users SET refresh_token = NULL WHERE user_id = $1', [user.user_id]);

    res.json({ message: 'Logout berhasil' });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Access token sudah kadaluarsa, silakan login ulang' });
    }
    console.error('Error during logout:', err);
    res.status(500).json({ error: 'Terjadi kesalahan di server' });
  }
});

module.exports = router;