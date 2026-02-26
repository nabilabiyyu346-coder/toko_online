🏺 Toko Gerabah — RESTful API

Aplikasi backend untuk sistem penjualan Toko Gerabah, dibuat menggunakan Node.js, Express, dan PostgreSQL.
Mendukung sistem autentikasi JWT dengan Access Token & Refresh Token, serta role-based access (Admin & Kasir).

📦 Fitur Utama
 Autentikasi JWT (Login, Logout, Refresh Token)
 Role-based Access Control (Admin / Kasir)
 CRUD penuh untuk Products, Categories, dan Transactions
 Transaksi otomatis dengan perhitungan total & pengurangan stok
 Database PostgreSQL

 src/
├── db/
│   └── pool.js
├── middleware/
│   ├── authorization.js
│   └── roleMiddleware.js
├── routes/
│   ├── users.js
│   ├── products.js
│   ├── categories.js
│   └── transactions.js
└── index.js

⚙️ Teknologi yang Digunakan
 Node.js — Server-side runtime
 Express.js — Web framework
 PostgreSQL — Database relasional
 jsonwebtoken (JWT) — Sistem autentikasi & otorisasi
 dotenv — Manajemen konfigurasi environment
 pg — PostgreSQL client untuk Node.js

🗄️ Struktur Database
Tabel users
Kolom	            Tipe	                Keterangan
user_id	          SERIAL PK	                ID pengguna
username	      VARCHAR(50)	            Nama unik
password	      VARCHAR(255)	            Kata sandi
full_name	      VARCHAR(100)	            Nama lengkap
role	          VARCHAR(20)	            admin / kasir
is_active	      BOOLEAN	                Status aktif
refresh_token	  TEXT	                    Token refresh
created_at	      TIMESTAMP	                Tanggal dibuat

Tabel categories
Kolom	           Tipe	                    Keterangan
category_id	      SERIAL PK	ID              kategori
name	          VARCHAR(100)	            Nama kategori
description	      TEXT	                    Deskripsi

Tabel products
Kolom	           Tipe	                    Keterangan
product_id	      SERIAL PK	                ID produk
category_id	      INT FK	                Kategori
name           	  VARCHAR(100)	            Nama produk
price	          NUMERIC(12,2)	            Harga
stock	          INT                       Stok barang
description	      TEXT	                    Deskripsi
image_url	      TEXT	                    URL gambar

Tabel transactions
Kolom	           Tipe	                    Keterangan
transaction_id	  SERIAL PK	                ID transaksi
user_id	          INT FK	                User kasir/admin
total_amount	  NUMERIC(12,2)	            Total transaksi
payment_method	  VARCHAR(20)	            cash / transfer
created_at	      TIMESTAMP	                Tanggal transaksi

Tabel transaction_details
Kolom	           Tipe	                    Keterangan
detail_id	      SERIAL PK	                ID detail
transaction_id	  INT FK	                ID transaksi
product_id	      INT FK	                ID produk
quantity	      INT	                    Jumlah item
subtotal	      NUMERIC(12,2)	            Subtotal harga per produk

🔐 Autentikasi & Token
 Access Token (15 menit) → untuk akses endpoint yang dilindungi
 Refresh Token (7 hari) → untuk memperbarui access token
 Logout → menghapus refresh token dari database
*(xx hari atau menit) = masa aktif token tsb.

Daftar Endpoint
 👥 USERS
Method	Endpoint	            Role	Deskripsi
POST	/users/login	        Semua	Login & dapatkan token
POST	/users/refresh	        Semua	Dapatkan access token baru
POST	/users/logout	        Semua	Logout & hapus refresh token
POST	/users/register	        Admin	Tambah user baru
PUT	    /users/deactivate/:id	Admin	Nonaktifkan user

 🏷️ CATEGORIES
Method	    Endpoint	        Role	Deskripsi
GET	        /categories	        Semua	Lihat semua kategori
GET	        /categories/:id	    Semua	Lihat kategori berdasarkan ID
PUT	        /categories/:id	    Admin	Ubah kategori
DELETE	    /categories/:id	    Admin	Hapus kategori

🛍️ PRODUCTS
Method	    Endpoint	    Role	Deskripsi
GET	        /products	    Semua	Lihat semua produk
GET	        /products/:id	Semua	Lihat produk berdasarkan ID
POST	    /products	    Admin	Tambah produk
PUT	        /products/:id	Admin	Edit produk
DELETE	    /products/:id	Admin	Hapus produk

💳 TRANSACTIONS
Method	    Endpoint	        Role	        Deskripsi
GET	        /transactions	    Kasir, Admin	Lihat semua transaksi
GET	        /transactions/:id	Kasir, Admin	Lihat detail transaksi
POST	    /transactions	    Kasir, Admin	Tambah transaksi baru
PUT	        /transactions/:id	Admin	        Ubah metode pembayaran

 Contoh Penggunaan API
🔹 Login
POST /users/login
Body: 
{
  "username": "admin",
  "password": "admin123"
}
Response:
{
  "message": "Login berhasil",
  "accessToken": "<token_akses>",
  "refreshToken": "<token_refresh>"
}

💬 Catatan
 Semua endpoint dengan token wajib memakai header: Authorization: Bearer <access_token>
 Jika Access Token expired → gunakan /users/refresh untuk mendapatkan token baru
 Logout akan menghapus Refresh Token dari database

👨‍💻 Pengembang
Nama: Ir. H. NABIL ABIYYU AMRU RAMADHAN, S.IT, M.IT, S.Pd, M.Pd, S.H, M.H
Proyek: Sistem Penjualan Toko Gerabah
Teknologi: Node.js, Express, PostgreSQL
Lisensi: MIT License

Run & Test (lokal)
1. Siapkan file environment di `backend/.env` berisi minimal:

  - `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_NAME`, `DB_PORT`
  - `ACCESS_TOKEN_SECRET` (string random)
  - `REFRESH_TOKEN_SECRET` (string random)

2. Jalankan backend:

```bash
cd "TUGAS H-1/backend"
npm install
node index.js
# atau: npx nodemon index.js
```

3. Buka frontend di browser (file static):

 - `TUGAS H-1/frontend/index.html` (login)
 - `TUGAS H-1/frontend/dashboard.html` (dashboard setelah login)

Catatan:
- Endpoint autentikasi berada di `/auth` (login, refresh, logout).
- Jika Access Token kadaluarsa, frontend akan otomatis mencoba `/auth/refresh`.
- Untuk admin: gunakan role `admin` pada tabel `users` untuk akses CRUD produk/kategori/users.

Jika mau, saya bisa:
- Menambahkan halaman CRUD produk dan kategori di frontend
- Menyambungkan forms create/edit/delete dengan API
- Menambahkan contoh data seed SQL
