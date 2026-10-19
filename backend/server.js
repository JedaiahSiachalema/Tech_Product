const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const db = require("./db");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Tech Product Showcase API is running." });
});

// GET /api/products — list all products
app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products ORDER BY id DESC", [], (error, rows) => {
    if (error) return res.status(500).json({ error: "Failed to fetch products." });
    res.json(rows);
  });
});

// GET /api/products/:id — fetch one product
app.get("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Product ID must be a positive integer." });
  }
  db.get("SELECT * FROM products WHERE id = ?", [id], (error, row) => {
    if (error) return res.status(500).json({ error: "Failed to fetch product." });
    if (!row) return res.status(404).json({ error: "Product not found." });
    res.json(row);
  });
});

function validateProduct(body) {
  const product_name = typeof body.product_name === "string" ? body.product_name.trim() : "";
  const brand = typeof body.brand === "string" ? body.brand.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const price = Number(body.price);
  const stock_quantity = Number(body.stock_quantity);

  if (!product_name || !brand || !category) {
    return { error: "product_name, brand, and category are required." };
  }
  if (body.price === "" || body.price === undefined || !Number.isFinite(price) || price < 0) {
    return { error: "price must be a number greater than or equal to zero." };
  }
  if (body.stock_quantity === "" || body.stock_quantity === undefined ||
      !Number.isInteger(stock_quantity) || stock_quantity < 0) {
    return { error: "stock_quantity must be a non-negative integer." };
  }
  return { value: { product_name, brand, category, price, stock_quantity, description } };
}

// POST /api/products — create a product
app.post("/api/products", (req, res) => {
  const validated = validateProduct(req.body || {});
  if (validated.error) return res.status(400).json({ error: validated.error });
  const p = validated.value;
  const sql = `INSERT INTO products
    (product_name, brand, category, price, stock_quantity, description)
    VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(sql, [p.product_name, p.brand, p.category, p.price, p.stock_quantity, p.description],
    function (error) {
      if (error) return res.status(500).json({ error: "Failed to create product." });
      db.get("SELECT * FROM products WHERE id = ?", [this.lastID], (fetchError, row) => {
        if (fetchError) return res.status(500).json({ error: "Product created but could not be retrieved." });
        res.status(201).json(row);
      });
    });
});

// PUT /api/products/:id — update a product
app.put("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Product ID must be a positive integer." });
  }
  const validated = validateProduct(req.body || {});
  if (validated.error) return res.status(400).json({ error: validated.error });
  const p = validated.value;
  const sql = `UPDATE products SET product_name = ?, brand = ?, category = ?,
    price = ?, stock_quantity = ?, description = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`;
  db.run(sql, [p.product_name, p.brand, p.category, p.price, p.stock_quantity, p.description, id],
    function (error) {
      if (error) return res.status(500).json({ error: "Failed to update product." });
      if (this.changes === 0) {
        return res.status(404).json({ error: "Product not found. Nothing was updated." });
      }
      db.get("SELECT * FROM products WHERE id = ?", [id], (fetchError, row) => {
        if (fetchError) return res.status(500).json({ error: "Product updated but could not be retrieved." });
        res.json(row);
      });
    });
});

// DELETE /api/products/:id — delete a product
app.delete("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "Product ID must be a positive integer." });
  }
  db.run("DELETE FROM products WHERE id = ?", [id], function (error) {
    if (error) return res.status(500).json({ error: "Failed to delete product." });
    if (this.changes === 0) return res.status(404).json({ error: "Product not found." });
    res.json({ success: true, message: `Product ${id} deleted successfully.` });
  });
});

// Return JSON for unknown API routes.
app.use("/api", (req, res) => res.status(404).json({ error: "API endpoint not found." }));

app.listen(PORT, () => {
  console.log(`Tech Product Showcase running at http://localhost:${PORT}`);
  console.log(`Products API: http://localhost:${PORT}/api/products`);
});
