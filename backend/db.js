const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

const configuredPath = process.env.DB_PATH || "./backend/products.db";
const dbPath = path.isAbsolute(configuredPath)
  ? configuredPath
  : path.resolve(process.cwd(), configuredPath);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error("Could not open SQLite database:", error.message);
    process.exit(1);
  }
  console.log(`SQLite database: ${dbPath}`);
});

db.serialize(() => {
  db.run(`
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
    )
  `, (error) => {
    if (error) {
      console.error("Could not create products table:", error.message);
      process.exit(1);
    }
    seedDatabase();
  });
});

function seedDatabase() {
  const products = [
    ["Galaxy S24", "Samsung", "Smartphone", 8999, 12, "Flagship Android smartphone"],
    ["iPhone 15", "Apple", "Smartphone", 12499, 8, "Apple smartphone with USB-C"],
    ["IdeaPad Slim 3", "Lenovo", "Laptop", 10999, 6, "Everyday laptop for study and work"],
    ["Pavilion 14", "HP", "Laptop", 13999, 4, "Compact productivity laptop"],
    ["WH-CH720N", "Sony", "Headphones", 2499, 15, "Wireless noise-cancelling headphones"],
    ["Soundcore Q20i", "Anker", "Headphones", 999, 20, "Bluetooth over-ear headphones"],
    ["iPad 10th Gen", "Apple", "Tablet", 6999, 7, "Tablet for learning and entertainment"],
    ["Galaxy Tab S9 FE", "Samsung", "Tablet", 6499, 5, "Android tablet with S Pen support"],
    ["MX Master 3S", "Logitech", "Accessories", 1899, 9, "Wireless productivity mouse"],
    ["T7 Shield 1TB", "Samsung", "Storage", 2199, 11, "Portable solid-state drive"]
  ];

  db.get("SELECT COUNT(*) AS count FROM products", (error, row) => {
    if (error) {
      console.error("Could not count products:", error.message);
      return;
    }
    if (row.count > 0) return;

    const statement = db.prepare(`
      INSERT INTO products
      (product_name, brand, category, price, stock_quantity, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const product of products) statement.run(product);
    statement.finalize((seedError) => {
      if (seedError) console.error("Could not insert sample products:", seedError.message);
      else console.log(`Inserted ${products.length} sample products.`);
    });
  });
}

module.exports = db;
