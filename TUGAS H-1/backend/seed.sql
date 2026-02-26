-- Schema and sample data for Toko Gerabah (run in PostgreSQL)

-- Users table (already expected by backend)
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS products (
  product_id SERIAL PRIMARY KEY,
  category_id INT REFERENCES categories(category_id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  price NUMERIC(12,2) DEFAULT 0,
  stock INT DEFAULT 0,
  description TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id),
  total_amount NUMERIC(12,2) DEFAULT 0,
  payment_method VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaction_details (
  detail_id SERIAL PRIMARY KEY,
  transaction_id INT REFERENCES transactions(transaction_id) ON DELETE CASCADE,
  product_id INT REFERENCES products(product_id),
  quantity INT,
  subtotal NUMERIC(12,2)
);

CREATE TABLE IF NOT EXISTS token_blacklist (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample categories
INSERT INTO categories (name, description) VALUES
('Keramik', 'Produk keramik tradisional'),
('Guci', 'Guci & vas decorative')
ON CONFLICT DO NOTHING;

-- Sample products
INSERT INTO products (category_id, name, price, stock, description) VALUES
(1, 'Cangkir Keramik', 25000, 50, 'Cangkir handmade'),
(1, 'Piring Saji', 40000, 20, 'Piring untuk hiasan'),
(2, 'Guci Besar', 150000, 5, 'Guci besar untuk dekor')
ON CONFLICT DO NOTHING;

-- Sample admin user (replace PASSWORD_HASH with a bcrypt hash)
-- To create a bcrypt hash quickly in Node:
-- node -e "console.log(require('bcrypt').hashSync('admin123', 10))"
-- Then paste the hash below in place of PASSWORD_HASH

INSERT INTO users (username, password, full_name, role) VALUES
('admin', '$2b$10$0JfxExjdlC8Ead48w0UGFuyRDY50TrAdZN4a6sHtiOtN0z8bbLF2S', 'Administrator', 'admin')
ON CONFLICT DO NOTHING;
