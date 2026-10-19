CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    description TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (product_name, brand, category, price, stock_quantity, description)
SELECT 'Galaxy S24', 'Samsung', 'Smartphone', 8999.00, 12, 'Flagship Android smartphone'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_name = 'Galaxy S24' AND brand = 'Samsung');

INSERT INTO products (product_name, brand, category, price, stock_quantity, description)
SELECT 'iPhone 15', 'Apple', 'Smartphone', 12499.00, 8, 'Apple smartphone with USB-C'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_name = 'iPhone 15' AND brand = 'Apple');

INSERT INTO products (product_name, brand, category, price, stock_quantity, description)
SELECT 'IdeaPad Slim 3', 'Lenovo', 'Laptop', 10999.00, 6, 'Everyday laptop for study and work'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_name = 'IdeaPad Slim 3' AND brand = 'Lenovo');

INSERT INTO products (product_name, brand, category, price, stock_quantity, description)
SELECT 'Pavilion 14', 'HP', 'Laptop', 13999.00, 4, 'Compact productivity laptop'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_name = 'Pavilion 14' AND brand = 'HP');

INSERT INTO products (product_name, brand, category, price, stock_quantity, description)
SELECT 'WH-CH720N', 'Sony', 'Headphones', 2499.00, 15, 'Wireless noise-cancelling headphones'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_name = 'WH-CH720N' AND brand = 'Sony');

INSERT INTO products (product_name, brand, category, price, stock_quantity, description)
SELECT 'Soundcore Q20i', 'Anker', 'Headphones', 999.00, 20, 'Bluetooth over-ear headphones'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_name = 'Soundcore Q20i' AND brand = 'Anker');

INSERT INTO products (product_name, brand, category, price, stock_quantity, description)
SELECT 'iPad 10th Gen', 'Apple', 'Tablet', 6999.00, 7, 'Tablet for learning and entertainment'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_name = 'iPad 10th Gen' AND brand = 'Apple');

INSERT INTO products (product_name, brand, category, price, stock_quantity, description)
SELECT 'Galaxy Tab S9 FE', 'Samsung', 'Tablet', 6499.00, 5, 'Android tablet with S Pen support'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_name = 'Galaxy Tab S9 FE' AND brand = 'Samsung');

INSERT INTO products (product_name, brand, category, price, stock_quantity, description)
SELECT 'MX Master 3S', 'Logitech', 'Accessories', 1899.00, 9, 'Wireless productivity mouse'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_name = 'MX Master 3S' AND brand = 'Logitech');

INSERT INTO products (product_name, brand, category, price, stock_quantity, description)
SELECT 'T7 Shield 1TB', 'Samsung', 'Storage', 2199.00, 11, 'Portable solid-state drive'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_name = 'T7 Shield 1TB' AND brand = 'Samsung');
