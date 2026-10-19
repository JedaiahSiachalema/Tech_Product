const API_URL = "/api/products";
const form = document.getElementById("product-form");
const productList = document.getElementById("product-list");
const notice = document.getElementById("notice");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("category-filter");
let products = [];
let noticeTimer;

function showNotice(message, type = "success") {
  clearTimeout(noticeTimer);
  notice.textContent = message;
  notice.className = `notice show ${type}`;
  noticeTimer = setTimeout(() => { notice.className = "notice"; }, 4500);
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

function money(value) {
  return new Intl.NumberFormat("en-ZM", {
    style: "currency", currency: "ZMW", maximumFractionDigits: 2
  }).format(Number(value));
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function updateStats() {
  document.getElementById("total-count").textContent = products.length;
  document.getElementById("category-count").textContent = new Set(products.map(p => p.category)).size;
  document.getElementById("stock-count").textContent = products.reduce((sum, p) => sum + Number(p.stock_quantity), 0);
}

function updateCategoryFilter() {
  const current = categoryFilter.value;
  const categories = [...new Set(products.map(p => p.category))].sort();
  categoryFilter.innerHTML = '<option value="">All categories</option>' +
    categories.map(category => `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`).join("");
  if (categories.includes(current)) categoryFilter.value = current;
}

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const visible = products.filter(product => {
    const searchable = `${product.product_name} ${product.brand} ${product.category} ${product.description}`.toLowerCase();
    return searchable.includes(query) && (!category || product.category === category);
  });

  if (!visible.length) {
    productList.innerHTML = `<tr><td colspan="5" class="empty">${products.length ? "No products match your search." : "No products yet. Add your first product using the form."}</td></tr>`;
  } else {
    productList.innerHTML = visible.map(product => `
      <tr>
        <td><div class="product-cell"><strong>${escapeHTML(product.product_name)}</strong><span>${escapeHTML(product.brand)} · ID ${product.id}</span></div></td>
        <td><span class="category-pill">${escapeHTML(product.category)}</span></td>
        <td>${money(product.price)}</td>
        <td class="${Number(product.stock_quantity) < 5 ? "stock-low" : ""}">${Number(product.stock_quantity)}</td>
        <td><div class="actions">
          <button class="action-btn" data-action="edit" data-id="${product.id}" type="button">Edit</button>
          <button class="action-btn delete" data-action="delete" data-id="${product.id}" type="button">Delete</button>
        </div></td>
      </tr>`).join("");
  }
  document.getElementById("table-foot").textContent = `Showing ${visible.length} of ${products.length} products · API: ${location.origin}/api/products`;
}

async function loadProducts() {
  productList.innerHTML = '<tr><td colspan="5" class="empty">Loading products…</td></tr>';
  try {
    products = await apiRequest(API_URL);
    updateStats();
    updateCategoryFilter();
    renderProducts();
  } catch (error) {
    productList.innerHTML = `<tr><td colspan="5" class="empty">Could not load products. Is the Node.js server running? ${escapeHTML(error.message)}</td></tr>`;
    showNotice(error.message, "error");
  }
}

function resetForm() {
  form.reset();
  document.getElementById("product-id").value = "";
  document.getElementById("form-title").textContent = "Add a product";
  document.getElementById("submit-button").textContent = "＋ Save product";
  document.getElementById("cancel-edit").classList.add("hidden");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = document.getElementById("product-id").value;
  const payload = {
    product_name: document.getElementById("product_name").value.trim(),
    brand: document.getElementById("brand").value.trim(),
    category: document.getElementById("category").value,
    price: document.getElementById("price").value,
    stock_quantity: document.getElementById("stock_quantity").value,
    description: document.getElementById("description").value.trim()
  };
  const button = document.getElementById("submit-button");
  button.disabled = true;
  try {
    await apiRequest(id ? `${API_URL}/${id}` : API_URL, {
      method: id ? "PUT" : "POST", body: JSON.stringify(payload)
    });
    showNotice(id ? "Product updated successfully." : "Product created successfully.");
    resetForm();
    await loadProducts();
  } catch (error) {
    showNotice(error.message, "error");
  } finally {
    button.disabled = false;
  }
});

productList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  const action = button.dataset.action;
  const product = products.find(item => Number(item.id) === id);
  if (!product) return;

  if (action === "edit") {
    document.getElementById("product-id").value = product.id;
    document.getElementById("product_name").value = product.product_name;
    document.getElementById("brand").value = product.brand;
    document.getElementById("category").value = product.category;
    document.getElementById("price").value = product.price;
    document.getElementById("stock_quantity").value = product.stock_quantity;
    document.getElementById("description").value = product.description || "";
    document.getElementById("form-title").textContent = `Edit product #${product.id}`;
    document.getElementById("submit-button").textContent = "✓ Save changes";
    document.getElementById("cancel-edit").classList.remove("hidden");
    document.getElementById("product_name").focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (action === "delete" && window.confirm(`Delete "${product.product_name}"? This cannot be undone.`)) {
    try {
      await apiRequest(`${API_URL}/${id}`, { method: "DELETE" });
      showNotice("Product deleted successfully.");
      if (document.getElementById("product-id").value === String(id)) resetForm();
      await loadProducts();
    } catch (error) {
      showNotice(error.message, "error");
    }
  }
});

document.getElementById("cancel-edit").addEventListener("click", resetForm);
document.getElementById("refresh-button").addEventListener("click", loadProducts);
searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);
loadProducts();
