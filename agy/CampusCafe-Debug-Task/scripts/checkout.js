const checkoutItemsEl = document.getElementById("checkout-items");
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const discountEl = document.getElementById("discount");
const grandTotalEl = document.getElementById("grand-total");

const promoInput = document.getElementById("promo-input");
const applyPromoBtn = document.getElementById("apply-promo-btn");
const promoMsgEl = document.getElementById("promo-msg");

const orderForm = document.getElementById("order-form");
const studentNameInput = document.getElementById("student-name");
const rollNumberInput = document.getElementById("roll-number");
const orderMsgEl = document.getElementById("order-msg");
const confirmOrderBtn = document.getElementById("confirm-order-btn");

let cart = [];
try {
  cart = JSON.parse(localStorage.getItem("campus_cart")) || [];
  if (!Array.isArray(cart)) cart = [];
} catch (e) {
  cart = [];
}

let discountAmount = 0;
let appliedPromo = null;

function calculateSubtotal() {
  return cart.reduce((sum, item) => sum + Number(item.price) * (item.qty || 1), 0);
}

function renderCheckout() {
  checkoutItemsEl.innerHTML = "";

  if (cart.length === 0) {
    checkoutItemsEl.innerHTML = '<li class="empty-state">No items found in your order.</li>';
  } else {
    cart.forEach((item) => {
      const li = document.createElement("li");
      li.className = "cart-row";
      const itemTotal = Number(item.price) * (item.qty || 1);
      li.innerHTML = `
        <span>${item.name} × ${item.qty || 1}</span>
        <span>₹${itemTotal.toFixed(2)}</span>
      `;
      checkoutItemsEl.appendChild(li);
    });
  }

  const subtotal = calculateSubtotal();

  // If subtotal drops below 150 (or cart is cleared), invalidate any applied promo
  if (appliedPromo === "STUDENT15") {
    if (subtotal >= 150) {
      discountAmount = subtotal * 0.15;
    } else {
      discountAmount = 0;
      appliedPromo = null;
    }
  } else {
    discountAmount = 0;
  }

  const tax = subtotal * 0.05;
  const grandTotal = Math.max(0, subtotal + tax - discountAmount);

  subtotalEl.textContent = subtotal.toFixed(2);
  taxEl.textContent = tax.toFixed(2);
  discountEl.textContent = discountAmount.toFixed(2);
  grandTotalEl.textContent = grandTotal.toFixed(2);
}

// Promo Code Handler
applyPromoBtn.addEventListener("click", () => {
  const code = promoInput.value.trim().toUpperCase();
  const subtotal = calculateSubtotal();

  if (!code) {
    discountAmount = 0;
    appliedPromo = null;
    promoMsgEl.className = "msg-error";
    promoMsgEl.textContent = "Please enter a promo code.";
    renderCheckout();
    return;
  }

  if (code === "STUDENT15") {
    if (subtotal >= 150) {
      appliedPromo = "STUDENT15";
      discountAmount = subtotal * 0.15;
      promoMsgEl.className = "msg-success";
      promoMsgEl.textContent = "Promo code STUDENT15 applied! (15% discount)";
    } else {
      discountAmount = 0;
      appliedPromo = null;
      promoMsgEl.className = "msg-error";
      promoMsgEl.textContent = "STUDENT15 requires a minimum subtotal of ₹150.";
    }
  } else {
    discountAmount = 0;
    appliedPromo = null;
    promoMsgEl.className = "msg-error";
    promoMsgEl.textContent = "Invalid promo code. Please try again.";
  }

  renderCheckout();
});

// Order Confirmation Form Handler
orderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (cart.length === 0) {
    orderMsgEl.className = "msg-error";
    orderMsgEl.textContent = "Cannot place order: your cart is empty.";
    return;
  }

  const studentName = studentNameInput.value.trim();
  const rollNumber = rollNumberInput.value.trim();

  if (!studentName || !rollNumber) {
    orderMsgEl.className = "msg-error";
    orderMsgEl.textContent = "Please enter both Full Name and Roll Number.";
    return;
  }

  // Generate order ID (e.g. CC-782910)
  const orderId = "CC-" + Math.floor(100000 + Math.random() * 900000);

  // Clear saved cart
  cart = [];
  localStorage.removeItem("campus_cart");
  discountAmount = 0;
  appliedPromo = null;

  // Display success confirmation
  orderMsgEl.className = "msg-success";
  orderMsgEl.innerHTML = `Order confirmed! Order ID: <strong>${orderId}</strong>. Thank you, ${studentName}!`;

  // Clear form inputs
  studentNameInput.value = "";
  rollNumberInput.value = "";
  promoInput.value = "";
  promoMsgEl.textContent = "";

  // Disable button to prevent re-submission
  if (confirmOrderBtn) {
    confirmOrderBtn.disabled = true;
    confirmOrderBtn.style.opacity = "0.6";
    confirmOrderBtn.style.cursor = "not-allowed";
  }

  // Re-render checkout summary
  renderCheckout();
});

// Initialize checkout page
renderCheckout();
