const menuGrid = document.getElementById("menu-grid");
const cartList = document.getElementById("cart-list");
const cartSubtotalEl = document.getElementById("cart-subtotal");
const cartCountEl = document.getElementById("cart-count");
const cartMsgEl = document.getElementById("cart-msg");
const checkoutBtn = document.getElementById("checkout-btn");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("search-input");

let cart = [];
try {
  cart = JSON.parse(localStorage.getItem("campus_cart")) || [];
  if (!Array.isArray(cart)) cart = [];
} catch (e) {
  cart = [];
}

let activeCategory = "all";
let searchQuery = "";

function renderMenu(items) {
  menuGrid.innerHTML = "";

  if (items.length === 0) {
    menuGrid.innerHTML = '<p class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 2rem 0;">No menu items found.</p>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="card-header">
        <span class="category-tag">${item.category}</span>
        <span class="price">₹${item.price}</span>
      </div>
      <h3>${item.name}</h3>
      <p style="font-size: 0.85rem; color: #6b7280;">${item.description}</p>
      <button class="btn btn-primary add-btn" data-id="${item.id}">Add to Cart</button>
    `;
    menuGrid.appendChild(card);
  });
}

function filterAndRenderMenu() {
  const query = searchQuery.trim().toLowerCase();
  const filtered = MENU_ITEMS.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      !query || item.name.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  renderMenu(filtered);
}

function addToCart(itemId) {
  const found = MENU_ITEMS.find((item) => item.id === itemId);
  if (!found) return;

  const existingItem = cart.find((item) => item.id === itemId);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    cart.push({
      id: found.id,
      name: found.name,
      price: Number(found.price),
      qty: 1
    });
  }

  cartMsgEl.textContent = "";
  saveCart();
  renderCart();
}

function updateQuantity(itemId, change) {
  const itemIndex = cart.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) return;

  cart[itemIndex].qty += change;

  if (cart[itemIndex].qty <= 0) {
    cart.splice(itemIndex, 1);
  }

  cartMsgEl.textContent = "";
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem("campus_cart", JSON.stringify(cart));
}

function renderCart() {
  cartList.innerHTML = "";

  if (cart.length === 0) {
    cartList.innerHTML = '<li class="empty-state">Your cart is empty.</li>';
  } else {
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.className = "cart-row";
      const itemTotal = Number(item.price) * item.qty;
      li.innerHTML = `
        <span>${item.name}</span>
        <div class="qty-controls">
          <button class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
        </div>
        <span>₹${itemTotal}</span>
      `;
      cartList.appendChild(li);
    });
  }

  let subtotal = 0;
  let totalCount = 0;
  cart.forEach((item) => {
    subtotal += Number(item.price) * item.qty;
    totalCount += item.qty;
  });

  cartSubtotalEl.textContent = subtotal;
  cartCountEl.textContent = totalCount;
}

// Event Delegation for Add-to-Cart buttons
menuGrid.addEventListener("click", (e) => {
  const addBtn = e.target.closest(".add-btn");
  if (addBtn) {
    const id = Number(addBtn.dataset.id);
    addToCart(id);
  }
});

// Event Delegation for Cart Quantity Controls (+ / -)
cartList.addEventListener("click", (e) => {
  const qtyBtn = e.target.closest(".qty-btn");
  if (!qtyBtn) return;
  const action = qtyBtn.dataset.action;
  const id = Number(qtyBtn.dataset.id);
  if (action === "increase") {
    updateQuantity(id, 1);
  } else if (action === "decrease") {
    updateQuantity(id, -1);
  }
});

// Filter Buttons
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.category || "all";
    filterAndRenderMenu();
  });
});

// Search Input
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    filterAndRenderMenu();
  });
}

// Checkout Button with Empty Cart Guard
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    cartMsgEl.textContent = "Your cart is empty. Please add items before checking out.";
    return;
  }
  cartMsgEl.textContent = "";
  window.location.href = "pages/checkout.html";
});

// Initialize page
filterAndRenderMenu();
renderCart();
