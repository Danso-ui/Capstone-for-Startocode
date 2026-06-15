// Data: All available products
const products = [
  { id: 1, name: "SAMSUNG TV", price: 1500 },
  { id: 2, name: "PIXEL 4a", price: 2500 },
  { id: 3, name: "PS 5", price: 4000 },
  { id: 4, name: "MACBOOK AIR", price: 8000 },
  { id: 5, name: "APPLE WATCH", price: 950 },
  { id: 6, name: "AIR PODS", price: 800 },
];

let cart = [];
let totalAmount = 0;

// Grab HTML elements
const cartModalOverlay = document.getElementById("cart-modal-overlay");
const successModalOverlay = document.getElementById("success-modal-overlay");
const cartItemsList = document.getElementById("cart-items-list");
const cartTotalPrice = document.getElementById("cart-total-price");
const emptyCartMsg = document.getElementById("empty-cart-msg");
const cartBadge = document.getElementById("cart-count");

// --- MAIN PAGE TOGGLE LOGIC ---
function toggleCart(productId) {
  const productCard = document.querySelector(
    `.product-card[data-id="${productId}"]`,
  );
  const button = productCard.querySelector(".cart-toggle-btn");
  const overlay = productCard.querySelector(".price-overlay");

  const itemIndexInCart = cart.findIndex((item) => item.id === productId);

  if (itemIndexInCart > -1) {
    cart.splice(itemIndexInCart, 1);
    button.textContent = "ADD TO CART";
    button.classList.remove("in-cart");
    overlay.classList.remove("show");
  } else {
    const productToAdd = products.find((item) => item.id === productId);
    cart.push({ ...productToAdd, quantity: 1 });
    button.textContent = "REMOVE FROM CART";
    button.classList.add("in-cart");
    overlay.classList.add("show");
  }
  cartBadge.textContent = cart.length;
}

// --- MODAL RENDERING (Table Format) ---
function renderCartItems() {
  cartItemsList.innerHTML = "";
  totalAmount = 0;

  if (cart.length === 0) {
    emptyCartMsg.style.display = "block";
    cartTotalPrice.textContent = "GH₵0";
    return;
  }

  emptyCartMsg.style.display = "none";

  cart.forEach((item, index) => {
    const lineTotal = item.price * item.quantity;
    totalAmount += lineTotal;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td>GH₵${lineTotal.toLocaleString()}</td>
      <td>
        <div class="qty-controls">
          <button class="qty-btn" onclick="decrementQuantity(${item.id})">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="incrementQuantity(${item.id})">+</button>
        </div>
      </td>
      <td>
        <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
      </td>
    `;
    cartItemsList.appendChild(tr);
  });

  cartTotalPrice.textContent = `GH₵${totalAmount.toLocaleString()}`;
}

// --- DYNAMIC CART BUTTON LOGIC ---
function incrementQuantity(productId) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity++;
    renderCartItems();
  }
}

function decrementQuantity(productId) {
  const item = cart.find((item) => item.id === productId);
  if (item && item.quantity > 1) {
    item.quantity--;
    renderCartItems();
  }
}

function removeFromCart(productId) {
  toggleCart(productId);
  renderCartItems();
}

// --- MODAL OPEN/CLOSE ---
function openCartModal() {
  renderCartItems();
  cartModalOverlay.classList.add("active");
}

function closeCartModal() {
  cartModalOverlay.classList.remove("active");
}

// --- PAYSTACK INTEGRATION ---
function payWithPaystack() {
  const name = document.getElementById("user-name").value;
  const email = document.getElementById("user-email").value;
  const phone = document.getElementById("user-phone").value;

  // Basic validation
  if (cart.length === 0) return alert("Your cart is empty!");
  if (!name || !email || !phone)
    return alert("Please fill in all your details (Name, Email, Phone).");

  // Open Paystack Checkout
  let handler = PaystackPop.setup({
    key: "pk_test_225bccd6ef90152b63049fae91c83a623c602d44",
    email: email,
    amount: totalAmount * 100,
    currency: "GHS",
    ref: "EMS_" + Math.floor(Math.random() * 1000000000 + 1),

    // On Success
    callback: function (response) {
      // 1. Close the cart modal
      closeCartModal();

      // 2. Populate and show the Success Modal
      showSuccessModal(name);
    },
    onClose: function () {
      alert("Transaction was cancelled.");
    },
  });

  handler.openIframe();
}

// --- SUCCESS MODAL LOGIC ---
function showSuccessModal(userName) {
  // Update Name in Header
  document.getElementById("success-message").innerHTML =
    `Thank You, <span>${userName}</span>, Your Order Has been Received`;

  // Populate Summary Table
  const summaryList = document.getElementById("summary-items-list");
  summaryList.innerHTML = "";

  cart.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
    `;
    summaryList.appendChild(tr);
  });

  // Show the overlay
  successModalOverlay.classList.add("active");
}

function closeSuccessModal() {
  // Hide Modal
  successModalOverlay.classList.remove("active");

  // Empty Cart Data & Reset Main UI
  cart = [];
  cartBadge.textContent = "0";
  document.querySelectorAll(".cart-toggle-btn").forEach((btn) => {
    btn.textContent = "ADD TO CART";
    btn.classList.remove("in-cart");
  });
  document.querySelectorAll(".price-overlay").forEach((overlay) => {
    overlay.classList.remove("show");
  });

  // Clear form inputs
  document.getElementById("user-name").value = "";
  document.getElementById("user-email").value = "";
  document.getElementById("user-phone").value = "";
}
