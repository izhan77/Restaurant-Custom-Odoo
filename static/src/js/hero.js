console.log("Custom JS loaded!");

// Wait for DOM ready
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM ready, initializing popup functionality");
  initializePopup();
});

function initializePopup() {
  console.log("Initializing popup...");

  const menuCards = document.querySelectorAll(".custom-card");
  const popup = document.querySelector(".menu-item-popup");
  const closeBtn = document.querySelector(".close-popup");
  const quantityElement = document.querySelector(".quantity");
  const minusBtn = document.querySelector(".qty-btn.minus");
  const plusBtn = document.querySelector(".qty-btn.plus");
  const popupPrice = document.querySelector(".popup-price");
  const popupAddToCartText = document.querySelector(".popup-add-to-cart-text");

  const addToCartBtn = document.querySelector(".add-to-cart");

  // NEW: Get cart elements
  const bottomCartBar = document.querySelector(".bottom-cart-bar");
  const viewCartBtn = document.querySelector(".view-cart-btn");
  const cartSidebar = document.querySelector(".cart-sidebar");
  const cartSidebarOverlay = document.querySelector(".cart-sidebar-overlay");
  const closeCartSidebar = document.querySelector(".close-cart-sidebar");

  if (!popup || !closeBtn || menuCards.length === 0) {
    console.error("Popup or required elements not found. Retrying...");
    setTimeout(initializePopup, 1000);
    return;
  }

  let quantity = 1;
  let cartItems = [];
  let cartTotal = 0;

  // Add click handler to product cards
  menuCards.forEach(function (card) {
    card.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      console.log("Product card clicked");

      // Get data from attributes
      const name = card.getAttribute("data-name") || "Product Name";
      const description =
        card.getAttribute("data-description") || "Product Description";
      const price = parseFloat(card.getAttribute("data-price")) || 0;
      const image =
        card.getAttribute("data-image") ||
        "/restaurant_custom/static/src/img/product1.png";

      console.log("Loaded product:", { name, description, price, image });

      // Update popup content
      const popupTitle = document.querySelector(".popup-title");
      const popupDescription = document.querySelector(".popup-description");
      const popupImg = document.querySelector(".popup-img");

      if (popupTitle) popupTitle.textContent = name;
      if (popupDescription) popupDescription.textContent = description;
      if (popupImg) popupImg.src = image;

      if (popupPrice) {
        popupPrice.textContent = "Rs. " + price.toFixed(2);
      }

      // Store unit price for later use
      popup.setAttribute("data-unit-price", price);

      // Reset quantity
      quantity = 1;
      updateQuantityDisplay();
      updateTotalPrice();

      // Show popup
      popup.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  // Close popup
  closeBtn.addEventListener("click", function () {
    popup.style.display = "none";
    document.body.style.overflow = "auto";
  });

  popup.addEventListener("click", function (e) {
    if (e.target === popup) {
      popup.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });

  // Quantity minus
  minusBtn.addEventListener("click", function (e) {
    e.preventDefault();
    if (quantity > 1) {
      quantity--;
      updateQuantityDisplay();
      updateTotalPrice();
    }
  });

  // Quantity plus
  plusBtn.addEventListener("click", function (e) {
    e.preventDefault();
    quantity++;
    updateQuantityDisplay();
    updateTotalPrice();
  });
  // NEW: Handle Add to Cart button click
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Add to cart clicked");

      // Get selected size (with null check)
      const sizeElement = document.querySelector(
        ".size-option.active .size-text"
      );
      const selectedSize = sizeElement ? sizeElement.textContent : "Regular";

      const instructionsElement = document.querySelector(
        ".special-instructions textarea"
      );
      const specialInstructions = instructionsElement
        ? instructionsElement.value
        : "";

      // Get current product data
      const unitPrice = parseFloat(popup.getAttribute("data-unit-price")) || 0;
      const productName =
        document.querySelector(".popup-title")?.textContent || "Product";
      const productImage =
        document.querySelector(".popup-img")?.src ||
        "/restaurant_custom/static/src/img/product1.png";

      // Add item to cart
      const cartItem = {
        name: productName,
        size: selectedSize,
        price: unitPrice,
        quantity: quantity,
        instructions: specialInstructions,
        image: productImage,
      };

      addItemToCart(cartItem);

      // Close popup
      popup.style.display = "none";
      document.body.style.overflow = "auto";

      // Show bottom cart bar
      showBottomCartBar();
    });
  }

  // NEW: Handle View Cart button click
  if (viewCartBtn) {
    viewCartBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("View cart clicked");
      showCartSidebar();
    });
  }

  // NEW: Handle cart sidebar close
  if (closeCartSidebar) {
    closeCartSidebar.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      hideCartSidebar();
    });
  }

  // NEW: Handle cart sidebar overlay click
  if (cartSidebarOverlay) {
    cartSidebarOverlay.addEventListener("click", function (e) {
      hideCartSidebar();
    });
  }
  // Helper functions
  function updateQuantityDisplay() {
    if (quantityElement) {
      quantityElement.textContent = quantity;
    }
  }

  function updateTotalPrice() {
    const unitPrice = parseFloat(popup.getAttribute("data-unit-price")) || 0;
    const totalPrice = unitPrice * quantity;
    if (popupAddToCartText)
      popupAddToCartText.textContent =
        "Rs. " + totalPrice.toFixed(2) + " Add to Cart";
  }

  // NEW: Add item to cart function
  function addItemToCart(item) {
    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(
      (cartItem) => cartItem.name === item.name && cartItem.size === item.size
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cartItems[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item to cart
      cartItems.push(item);
    }

    updateCartDisplay();
    console.log("Cart items:", cartItems);
  }

  // NEW: Update cart display
  function updateCartDisplay() {
    // Calculate total
    cartTotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const tax = Math.round(cartTotal * 0.15);
    const finalTotal = cartTotal + tax;

    // Update bottom cart bar
    const cartCount = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
    const cartBadge = document.querySelector(".cart-count");
    const cartTotalElement = document.querySelector(".cart-total");

    if (cartBadge) cartBadge.textContent = cartCount;
    if (cartTotalElement) cartTotalElement.textContent = `Rs. ${finalTotal}`;

    // Update cart sidebar
    updateCartSidebarDisplay();
  }

  // NEW: Update cart sidebar display
  function updateCartSidebarDisplay() {
    const cartItemsContainer = document.querySelector(".cart-items");
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";

    cartItems.forEach((item, index) => {
      const cartItemElement = document.createElement("div");
      cartItemElement.className = "cart-item";
      cartItemElement.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}"/>
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>(${item.size})</p>
                    <span class="cart-item-price">Rs. ${item.price}</span>
                </div>
                <div class="cart-item-controls">
                    <button class="cart-item-delete" data-index="${index}">🗑</button>
                    <div class="cart-quantity-controls">
                        <button class="cart-qty-minus" data-index="${index}">-</button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button class="cart-qty-plus" data-index="${index}">+</button>
                    </div>
                </div>
            `;
      cartItemsContainer.appendChild(cartItemElement);
    });

    // Add event listeners to cart item controls
    addCartItemEventListeners();

    // Update tax and total
    const tax = Math.round(cartTotal * 0.15);
    const cartTaxElement = document.querySelector(".cart-tax span:last-child");
    if (cartTaxElement) cartTaxElement.textContent = `Rs. ${tax}`;
  }

  // NEW: Add event listeners to cart item controls
  function addCartItemEventListeners() {
    // Delete buttons
    document.querySelectorAll(".cart-item-delete").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = parseInt(this.dataset.index);
        cartItems.splice(index, 1);
        updateCartDisplay();
        if (cartItems.length === 0) {
          hideBottomCartBar();
          hideCartSidebar();
        }
      });
    });

    // Quantity minus buttons
    document.querySelectorAll(".cart-qty-minus").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = parseInt(this.dataset.index);
        if (cartItems[index].quantity > 1) {
          cartItems[index].quantity--;
          updateCartDisplay();
        }
      });
    });

    // Quantity plus buttons
    document.querySelectorAll(".cart-qty-plus").forEach((btn) => {
      btn.addEventListener("click", function () {
        const index = parseInt(this.dataset.index);
        cartItems[index].quantity++;
        updateCartDisplay();
      });
    });
  }

  // NEW: Show bottom cart bar
  function showBottomCartBar() {
    if (bottomCartBar) {
      bottomCartBar.style.display = "block";
    }
  }

  // NEW: Hide bottom cart bar
  function hideBottomCartBar() {
    if (bottomCartBar) {
      bottomCartBar.style.display = "none";
    }
  }

  // NEW: Show cart sidebar
  function showCartSidebar() {
    if (cartSidebar) {
      cartSidebar.style.display = "block";
      // Trigger animation
      setTimeout(() => {
        cartSidebar.classList.add("active");
      }, 10);
    }
  }

  // NEW: Hide cart sidebar
  function hideCartSidebar() {
    if (cartSidebar) {
      cartSidebar.classList.remove("active");
      setTimeout(() => {
        cartSidebar.style.display = "none";
      }, 300);
    }
  }
  console.log("Popup functionality initialized successfully!");
}

// Fallback for delayed elements
setTimeout(initializePopup, 1500);
