console.log("Custom JS loaded!");

// Function to initialize popup functionality
function initializePopup() {
    console.log("Trying to initialize popup functionality");

    // Get elements
    const menuCard = document.querySelector('.single-menu-card');
    const popup = document.querySelector('.menu-item-popup');
    const closeBtn = document.querySelector('.close-popup');
    const sizeOptions = document.querySelectorAll('.size-option');
    const quantityElement = document.querySelector('.quantity');
    const minusBtn = document.querySelector('.qty-btn.minus');
    const plusBtn = document.querySelector('.qty-btn.plus');
    const addToCartBtn = document.querySelector('.add-to-cart');

    // NEW: Get cart elements
    const bottomCartBar = document.querySelector('.bottom-cart-bar');
    const viewCartBtn = document.querySelector('.view-cart-btn');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartSidebarOverlay = document.querySelector('.cart-sidebar-overlay');
    const closeCartSidebar = document.querySelector('.close-cart-sidebar');

    console.log("Elements found:", {
        menuCard: !!menuCard,
        popup: !!popup,
        closeBtn: !!closeBtn,
        sizeOptions: sizeOptions.length,
        quantityElement: !!quantityElement,
        minusBtn: !!minusBtn,
        plusBtn: !!plusBtn,
        bottomCartBar: !!bottomCartBar,
        viewCartBtn: !!viewCartBtn,
        cartSidebar: !!cartSidebar
    });

    // Check if elements exist
    if (!menuCard || !popup || !closeBtn) {
        console.error("Required elements not found, retrying in 500ms...");
        setTimeout(initializePopup, 500);
        return;
    }

    console.log("All elements found, setting up event listeners");

    let quantity = 1;
    let selectedPrice = 1699;
    let cartItems = [];
    let cartTotal = 0;

    // Remove any existing event listeners by cloning nodes
    const newMenuCard = menuCard.cloneNode(true);
    menuCard.parentNode.replaceChild(newMenuCard, menuCard);

    // Open popup when menu card is clicked
    newMenuCard.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Menu card clicked");
        popup.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Reset to default values
        quantity = 1;
        selectedPrice = 1699;
        updateQuantityDisplay();
        updateAddToCartButton();
    });

    // Close popup when close button is clicked
    closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Close button clicked");
        popup.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    // Close popup when clicking outside
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            console.log("Clicked outside popup");
            popup.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Handle size selection
    sizeOptions.forEach(function(option) {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Size option clicked");

            // Remove active class from all options
            sizeOptions.forEach(function(opt) {
                opt.classList.remove('active');
                const radio = opt.querySelector('input[type="radio"]');
                if (radio) radio.checked = false;
            });

            // Add active class to clicked option
            this.classList.add('active');
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;

            // Update selected price
            const priceText = this.querySelector('.size-price').textContent;
            selectedPrice = parseInt(priceText.replace(/[^\d]/g, ''));
            updateAddToCartButton();
        });

        // Also handle radio button clicks
        const radio = option.querySelector('input[type="radio"]');
        if (radio) {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    sizeOptions.forEach(function(opt) {
                        opt.classList.remove('active');
                    });
                    option.classList.add('active');

                    const priceText = option.querySelector('.size-price').textContent;
                    selectedPrice = parseInt(priceText.replace(/[^\d]/g, ''));
                    updateAddToCartButton();
                }
            });
        }
    });

    // Handle quantity controls
    if (minusBtn) {
        minusBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (quantity > 1) {
                quantity--;
                updateQuantityDisplay();
                updateAddToCartButton();
            }
        });
    }

    if (plusBtn) {
        plusBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            quantity++;
            updateQuantityDisplay();
            updateAddToCartButton();
        });
    }

    // NEW: Handle Add to Cart button click
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Add to cart clicked");

            // Get selected size
            const selectedSize = document.querySelector('.size-option.active .size-text').textContent;
            const specialInstructions = document.querySelector('.special-instructions textarea').value;

            // Add item to cart
            const cartItem = {
                name: "Chicken Madbee",
                size: selectedSize,
                price: selectedPrice,
                quantity: quantity,
                instructions: specialInstructions,
                image: "/restaurant_custom/static/src/img/s10.PNG"
            };

            addItemToCart(cartItem);

            // Close popup
            popup.style.display = 'none';
            document.body.style.overflow = 'auto';

            // Show bottom cart bar
            showBottomCartBar();
        });
    }

    // NEW: Handle View Cart button click
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("View cart clicked");
            showCartSidebar();
        });
    }

    // NEW: Handle cart sidebar close
    if (closeCartSidebar) {
        closeCartSidebar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideCartSidebar();
        });
    }

    // NEW: Handle cart sidebar overlay click
    if (cartSidebarOverlay) {
        cartSidebarOverlay.addEventListener('click', function(e) {
            hideCartSidebar();
        });
    }

    // Update quantity display
    function updateQuantityDisplay() {
        if (quantityElement) {
            quantityElement.textContent = quantity;
        }
    }

    // Update add to cart button
    function updateAddToCartButton() {
        if (addToCartBtn) {
            const totalPrice = selectedPrice * quantity;
            const span = addToCartBtn.querySelector('span:first-child');
            if (span) {
                span.textContent = `Rs. ${totalPrice} Add to Cart`;
            }
        }
    }

    // NEW: Add item to cart function
    function addItemToCart(item) {
        // Check if item already exists in cart
        const existingItemIndex = cartItems.findIndex(cartItem =>
            cartItem.name === item.name && cartItem.size === item.size
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
        cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = Math.round(cartTotal * 0.15);
        const finalTotal = cartTotal + tax;

        // Update bottom cart bar
        const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
        const cartBadge = document.querySelector('.cart-count');
        const cartTotalElement = document.querySelector('.cart-total');

        if (cartBadge) cartBadge.textContent = cartCount;
        if (cartTotalElement) cartTotalElement.textContent = `Rs. ${finalTotal}`;

        // Update cart sidebar
        updateCartSidebarDisplay();
    }

    // NEW: Update cart sidebar display
    function updateCartSidebarDisplay() {
        const cartItemsContainer = document.querySelector('.cart-items');
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';

        cartItems.forEach((item, index) => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
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
        const cartTaxElement = document.querySelector('.cart-tax span:last-child');
        if (cartTaxElement) cartTaxElement.textContent = `Rs. ${tax}`;
    }

    // NEW: Add event listeners to cart item controls
    function addCartItemEventListeners() {
        // Delete buttons
        document.querySelectorAll('.cart-item-delete').forEach(btn => {
            btn.addEventListener('click', function() {
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
        document.querySelectorAll('.cart-qty-minus').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                if (cartItems[index].quantity > 1) {
                    cartItems[index].quantity--;
                    updateCartDisplay();
                }
            });
        });

        // Quantity plus buttons
        document.querySelectorAll('.cart-qty-plus').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                cartItems[index].quantity++;
                updateCartDisplay();
            });
        });
    }

    // NEW: Show bottom cart bar
    function showBottomCartBar() {
        if (bottomCartBar) {
            bottomCartBar.style.display = 'block';
        }
    }

    // NEW: Hide bottom cart bar
    function hideBottomCartBar() {
        if (bottomCartBar) {
            bottomCartBar.style.display = 'none';
        }
    }

    // NEW: Show cart sidebar
    function showCartSidebar() {
        if (cartSidebar) {
            cartSidebar.style.display = 'block';
            // Trigger animation
            setTimeout(() => {
                cartSidebar.classList.add('active');
            }, 10);
        }
    }

    // NEW: Hide cart sidebar
    function hideCartSidebar() {
        if (cartSidebar) {
            cartSidebar.classList.remove('active');
            setTimeout(() => {
                cartSidebar.style.display = 'none';
            }, 300);
        }
    }

    console.log("Event listeners attached successfully!");
}

// Try multiple initialization methods
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePopup);
} else {
    initializePopup();
}

// Also try after window load
window.addEventListener('load', function() {
    setTimeout(initializePopup, 100);
});

// For Odoo, also try with a timeout
setTimeout(initializePopup, 1000);
setTimeout(initializePopup, 2000);