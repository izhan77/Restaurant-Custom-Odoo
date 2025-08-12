console.log("Enhanced Custom JS with Checkout loaded!");

// Function to initialize popup and checkout functionality
function initializePopup() {
    console.log("Trying to initialize popup and checkout functionality");

    // Get elements
    const menuCard = document.querySelector('.single-menu-card');
    const popup = document.querySelector('.menu-item-popup');
    const closeBtn = document.querySelector('.close-popup');
    const sizeOptions = document.querySelectorAll('.size-option');
    const quantityElement = document.querySelector('.quantity');
    const minusBtn = document.querySelector('.qty-btn.minus');
    const plusBtn = document.querySelector('.qty-btn.plus');
    const addToCartBtn = document.querySelector('.add-to-cart');

    // Cart elements
    const bottomCartBar = document.querySelector('.bottom-cart-bar');
    const viewCartBtn = document.querySelector('.view-cart-btn');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const cartSidebarOverlay = document.querySelector('.cart-sidebar-overlay');
    const closeCartSidebar = document.querySelector('.close-cart-sidebar');

    // Checkout elements
    const checkoutPage = document.querySelector('.checkout-page');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const backToMenuBtn = document.querySelector('.back-to-menu');
    const addMoreItemsBtn = document.querySelector('.add-more-items');
    const cancelReturnBtn = document.querySelector('.cancel-return-btn');

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
        cartSidebar: !!cartSidebar,
        checkoutPage: !!checkoutPage,
        checkoutBtn: !!checkoutBtn
    });

    // Check if required elements exist
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

    // Handle Add to Cart button click
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

    // Handle View Cart button click
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("View cart clicked");
            showCartSidebar();
        });
    }

    // Handle cart sidebar close
    if (closeCartSidebar) {
        closeCartSidebar.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideCartSidebar();
        });
    }

    // Handle cart sidebar overlay click
    if (cartSidebarOverlay) {
        cartSidebarOverlay.addEventListener('click', function(e) {
            hideCartSidebar();
        });
    }

    // Handle checkout button click
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Checkout button clicked");
            showCheckoutPage();
        });
    }

    // Handle back to menu button
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Back to menu clicked");
            hideCheckoutPage();
        });
    }

    // Handle add more items button
    if (addMoreItemsBtn) {
        addMoreItemsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Add more items clicked");
            hideCheckoutPage();
            // Optionally scroll to menu section
            const menuSection = document.querySelector('.popular-items');
            if (menuSection) {
                menuSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Handle cancel and return button
    if (cancelReturnBtn) {
        cancelReturnBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Cancel and return clicked");
            hideCheckoutPage();
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

    // Add item to cart function
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

    // Update cart display
    function updateCartDisplay() {
        // Calculate total
        cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        const tax = Math.round(cartTotal * 0.15);
        const deliveryFee = cartItems.length > 0 ? 150 : 0;
        const finalTotal = cartTotal + tax + deliveryFee;

        // Update bottom cart bar
        const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
        const cartBadge = document.querySelector('.cart-count');
        const cartTotalElement = document.querySelector('.cart-total');

        if (cartBadge) cartBadge.textContent = cartCount;
        if (cartTotalElement) cartTotalElement.textContent = `Rs. ${finalTotal}`;

        // Update cart sidebar
        updateCartSidebarDisplay();

        // Update checkout page if visible
        updateCheckoutDisplay();
    }

    // Update cart sidebar display
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

    // Update checkout display
    function updateCheckoutDisplay() {
        const checkoutCartItems = document.querySelector('.checkout-cart-items');
        if (!checkoutCartItems) return;

        checkoutCartItems.innerHTML = '';

        cartItems.forEach((item, index) => {
            const checkoutItemElement = document.createElement('div');
            checkoutItemElement.className = 'checkout-cart-item';
            checkoutItemElement.innerHTML = `
                <div class="checkout-item-image">
                    <img src="${item.image}" alt="${item.name}"/>
                </div>
                <div class="checkout-item-details">
                    <div class="checkout-item-name">${item.name}</div>
                    <div class="checkout-item-size">${item.size}</div>
                    <div class="checkout-item-price">Rs. ${item.price}</div>
                </div>
                <div class="checkout-item-quantity">×${item.quantity}</div>
            `;
            checkoutCartItems.appendChild(checkoutItemElement);
        });

        // Update totals in checkout
        const subtotalAmount = document.querySelector('.subtotal-amount');
        const deliveryAmount = document.querySelector('.delivery-amount');
        const taxAmount = document.querySelector('.tax-amount');
        const grandTotalAmount = document.querySelector('.grand-total-amount');

        const deliveryFee = cartItems.length > 0 ? 150 : 0;
        const tax = Math.round(cartTotal * 0.15);
        const grandTotal = cartTotal + deliveryFee + tax;

        if (subtotalAmount) subtotalAmount.textContent = `Rs. ${cartTotal.toLocaleString()}`;
        if (deliveryAmount) deliveryAmount.textContent = `Rs. ${deliveryFee}`;
        if (taxAmount) taxAmount.textContent = `Rs. ${tax}`;
        if (grandTotalAmount) grandTotalAmount.textContent = `Rs. ${grandTotal.toLocaleString()}`;
    }

    // Add event listeners to cart item controls
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
                    hideCheckoutPage();
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

    // Show bottom cart bar
    function showBottomCartBar() {
        if (bottomCartBar) {
            bottomCartBar.style.display = 'block';
        }
    }

    // Hide bottom cart bar
    function hideBottomCartBar() {
        if (bottomCartBar) {
            bottomCartBar.style.display = 'none';
        }
    }

    // Show cart sidebar
    function showCartSidebar() {
        if (cartSidebar) {
            cartSidebar.style.display = 'block';
            // Trigger animation
            setTimeout(() => {
                cartSidebar.classList.add('active');
            }, 10);
        }
    }

    // Hide cart sidebar
    function hideCartSidebar() {
        if (cartSidebar) {
            cartSidebar.classList.remove('active');
            setTimeout(() => {
                cartSidebar.style.display = 'none';
            }, 300);
        }
    }

    // Show checkout page
    function showCheckoutPage() {
        if (checkoutPage && cartItems.length > 0) {
            // Hide cart sidebar first
            hideCartSidebar();

            // Update checkout display with current cart
            updateCheckoutDisplay();

            // Show checkout page
            checkoutPage.style.display = 'block';
            checkoutPage.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Initialize checkout functionality
            initializeCheckoutFeatures();

            console.log("Checkout page shown");
        } else {
            console.log("Cannot show checkout: no items in cart");
        }
    }

    // Hide checkout page
    function hideCheckoutPage() {
        if (checkoutPage) {
            checkoutPage.classList.remove('active');
            setTimeout(() => {
                checkoutPage.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
            console.log("Checkout page hidden");
        }
    }

    // Initialize checkout-specific features
    function initializeCheckoutFeatures() {
        console.log("Initializing checkout features");

        // Payment method selection
        const paymentOptions = document.querySelectorAll('.payment-option');
        const cardPaymentForm = document.querySelector('.card-payment-form');

        paymentOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove active class from all options
                paymentOptions.forEach(opt => opt.classList.remove('active'));

                // Add active class to clicked option
                this.classList.add('active');

                // Show/hide card form based on selection
                const method = this.dataset.method;
                if (method === 'card') {
                    cardPaymentForm.style.display = 'block';
                    cardPaymentForm.classList.add('active');
                } else {
                    cardPaymentForm.style.display = 'none';
                    cardPaymentForm.classList.remove('active');
                }
            });
        });

        // Card number formatting
        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                e.target.value = value;
            });
        }

        // Expiry date formatting
        const expiryInput = document.getElementById('expiryDate');
        if (expiryInput) {
            expiryInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        // Phone number formatting
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                e.target.value = value;
            });
        }

        // Promo code handling
        const applyPromoBtn = document.querySelector('.apply-promo');
        const promoInput = document.getElementById('promoCode');

        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', function() {
                const promoCode = promoInput.value.trim();
                if (promoCode) {
                    // Here you would typically validate the promo code
                    console.log("Applying promo code:", promoCode);

                    // For demo, let's apply a 10% discount
                    applyPromoDiscount(promoCode);
                } else {
                    showNotification('Please enter a promo code', 'error');
                }
            });
        }

        // Place order button
        const placeOrderBtn = document.querySelector('.place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Validate form
                if (validateCheckoutForm()) {
                    processOrder();
                } else {
                    console.log("Form validation failed");
                }
            });
        }

        // Suggestion cards click handlers
        document.querySelectorAll('.suggestion-card').forEach(card => {
            card.addEventListener('click', function() {
                // Here you would add the suggested item to cart
                console.log("Suggestion card clicked");
                // For demo purposes, just log
            });
        });
    }

    // Apply promo discount
    function applyPromoDiscount(promoCode) {
        // Demo promo codes
        const promoCodes = {
            'SAVE10': 0.1,
            'WELCOME': 0.15,
            'NEWUSER': 0.2
        };

        const discount = promoCodes[promoCode.toUpperCase()];

        if (discount) {
            const discountAmount = Math.round(cartTotal * discount);

            // Add discount line to totals
            let discountLine = document.querySelector('.discount-line');
            if (!discountLine) {
                discountLine = document.createElement('div');
                discountLine.className = 'total-line discount-line';
                discountLine.innerHTML = `
                    <span>Discount (${promoCode})</span>
                    <span class="discount-amount" style="color: green;">-Rs. ${discountAmount}</span>
                `;

                // Insert before grand total
                const grandTotalLine = document.querySelector('.total-line.grand-total');
                grandTotalLine.parentNode.insertBefore(discountLine, grandTotalLine);
            } else {
                discountLine.querySelector('.discount-amount').textContent = `-Rs. ${discountAmount}`;
            }

            // Update grand total
            updateGrandTotal();

            // Show success message
            const promoInput = document.getElementById('promoCode');
            promoInput.style.borderColor = 'green';
            promoInput.value = `${promoCode} applied ✓`;
            promoInput.disabled = true;

            const applyBtn = document.querySelector('.apply-promo');
            applyBtn.textContent = 'Applied';
            applyBtn.style.backgroundColor = 'green';
            applyBtn.disabled = true;

        } else {
            // Show error
            const promoInput = document.getElementById('promoCode');
            promoInput.style.borderColor = 'red';
            setTimeout(() => {
                promoInput.style.borderColor = '#ddd';
            }, 2000);

            showNotification('Invalid promo code', 'error');
        }
    }

    // Update grand total
    function updateGrandTotal() {
        const subtotal = cartTotal;
        const deliveryFee = 150;
        const tax = Math.round(cartTotal * 0.15);

        // Get discount if any
        const discountElement = document.querySelector('.discount-amount');
        let discount = 0;
        if (discountElement) {
            discount = parseInt(discountElement.textContent.replace(/[^\d]/g, ''));
        }

        const grandTotal = subtotal + deliveryFee + tax - discount;

        const grandTotalElement = document.querySelector('.grand-total-amount');
        if (grandTotalElement) {
            grandTotalElement.textContent = `Rs. ${grandTotal.toLocaleString()}`;
        }
    }

    // Validate checkout form
    function validateCheckoutForm() {
        const requiredFields = [
            'firstName',
            'lastName',
            'phone',
            'address'
        ];

        let isValid = true;
        const errors = [];

        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field && !field.value.trim()) {
                field.style.borderColor = 'red';
                isValid = false;
                errors.push(`${fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);

                // Reset border color after 3 seconds
                setTimeout(() => {
                    field.style.borderColor = '#ddd';
                }, 3000);
            }
        });

        // Validate phone number
        const phoneField = document.getElementById('phone');
        if (phoneField && phoneField.value.trim()) {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phoneField.value.replace(/\s/g, ''))) {
                phoneField.style.borderColor = 'red';
                isValid = false;
                errors.push('Please enter a valid 10-digit phone number');

                setTimeout(() => {
                    phoneField.style.borderColor = '#ddd';
                }, 3000);
            }
        }

        // If card payment is selected, validate card fields
        const cardPaymentForm = document.querySelector('.card-payment-form.active');
        if (cardPaymentForm) {
            const cardFields = ['cardNumber', 'cardName', 'expiryDate', 'cvv'];

            cardFields.forEach(fieldName => {
                const field = document.getElementById(fieldName);
                if (field && !field.value.trim()) {
                    field.style.borderColor = 'red';
                    isValid = false;
                    errors.push(`${fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} is required`);

                    setTimeout(() => {
                        field.style.borderColor = '#ddd';
                    }, 3000);
                }
            });
        }

        if (!isValid) {
            showNotification('Please fill in all required fields:\n\n' + errors.join('\n'), 'error');
        }

        return isValid;
    }

    // NEW: Show notification function
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icon}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    // NEW: Success popup function
    function showSuccessPopup(orderData) {
        // Create success popup
        const successPopup = document.createElement('div');
        successPopup.className = 'success-popup-overlay';

        successPopup.innerHTML = `
            <div class="success-popup">
                <div class="success-popup-header">
                    <div class="success-icon">
                        <i class="fa fa-check-circle"></i>
                    </div>
                    <h2>Order Successful!</h2>
                    <p>Thank you for your order</p>
                </div>

                <div class="success-popup-body">
                    <div class="order-summary-success">
                        <div class="order-id">
                            <strong>Order ID: #${orderData.orderId}</strong>
                        </div>

                        <div class="order-details">
                            <div class="detail-row">
                                <span>Customer:</span>
                                <span>${orderData.customer.firstName} ${orderData.customer.lastName}</span>
                            </div>
                            <div class="detail-row">
                                <span>Phone:</span>
                                <span>+92 ${orderData.customer.phone}</span>
                            </div>
                            <div class="detail-row">
                                <span>Total Amount:</span>
                                <span class="total-amount">Rs. ${orderData.totals.grandTotal.toLocaleString()}</span>
                            </div>
                            <div class="detail-row">
                                <span>Payment Method:</span>
                                <span>${orderData.payment.method === 'cash' ? 'Cash on Delivery' : 'Card Payment'}</span>
                            </div>
                            <div class="detail-row">
                                <span>Estimated Delivery:</span>
                                <span>30-45 minutes</span>
                            </div>
                        </div>
                    </div>

                    <div class="success-actions">
                        <p class="success-message">
                            <i class="fa fa-phone"></i>
                            You will receive a confirmation call shortly
                        </p>
                        <p class="success-message">
                            <i class="fa fa-sms"></i>
                            SMS confirmation sent to your number
                        </p>
                    </div>
                </div>

                <div class="success-popup-footer">
                    <button class="continue-shopping-btn" onclick="closeSuccessPopup()">
                        <i class="fa fa-shopping-bag"></i>
                        Continue Shopping
                    </button>
                    <button class="track-order-btn">
                        <i class="fa fa-map-marker-alt"></i>
                        Track Order
                    </button>
                </div>
            </div>
        `;

        // Add to page
        document.body.appendChild(successPopup);

        // Show animation
        setTimeout(() => {
            successPopup.classList.add('show');
        }, 100);

        // Add event listeners
        const trackOrderBtn = successPopup.querySelector('.track-order-btn');
        trackOrderBtn.addEventListener('click', function() {
            showNotification('Order tracking will be available shortly!', 'info');
        });
    }

    // NEW: Actual SMS sending function (replace with your real API)
    // Modify the sendSMS function to provide better error messages
async function sendSMS(phone, message) {
    try {
        const response = await fetch('/kababjees/send_sms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phone: phone,
                message: message
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('SMS Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to send SMS'
        };
    }
}

    // Process order with proper state management
    async function processOrder() {
    console.log("Processing order...");

    const placeOrderBtn = document.querySelector('.place-order-btn');
    if (!placeOrderBtn) return;

    // Prevent multiple submissions
    if (placeOrderBtn.dataset.processing === 'true') return;
    placeOrderBtn.dataset.processing = 'true';

    const originalText = placeOrderBtn.innerHTML;
    placeOrderBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Processing Order...';
    placeOrderBtn.disabled = true;

    try {
        // Generate order data
        const orderData = {
            orderId: 'KB' + Date.now().toString().slice(-6),
            customer: {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value || '',
                address: document.getElementById('address').value
            },
            items: [...cartItems],
            payment: {
                method: document.querySelector('.payment-option.active').dataset.method
            },
            totals: {
                subtotal: cartTotal,
                deliveryFee: 150,
                tax: Math.round(cartTotal * 0.15),
                grandTotal: cartTotal + 150 + Math.round(cartTotal * 0.15)
            }
        };

        // Format phone number for Twilio
        const phone = document.getElementById('phone').value;
        const formattedPhone = `+92${phone.replace(/\D/g, '')}`;
        const message = `🍽️ Kababjees Order Confirmed!\nOrder #${orderData.orderId}\nTotal: Rs. ${orderData.totals.grandTotal.toLocaleString()}\nDelivery: 30-45 mins`;

        // Send SMS via Odoo endpoint
        const smsResult = await sendSMS(formattedPhone, message);

        if (!smsResult.success) {
            console.error('SMS failed:', smsResult.error);
            showNotification('Order placed but SMS failed: ' + smsResult.error, 'warning');
        }

        // Show success UI
        showSuccessPopup(orderData);

        // Clear cart
        cartItems = [];
        cartTotal = 0;
        updateCartDisplay();
        hideCheckoutPage();
        hideBottomCartBar();

    } catch (error) {
        console.error('Order processing error:', error);
        let errorMsg = 'Order processing failed. ';

        if (error.message.includes('404')) {
            errorMsg += 'Server configuration error (SMS endpoint not found)';
        } else {
            errorMsg += error.message;
        }

        showNotification(errorMsg, 'error');
    } finally {
        // Reset button state
        placeOrderBtn.innerHTML = originalText;
        placeOrderBtn.disabled = false;
        delete placeOrderBtn.dataset.processing;
    }
}

    console.log("Event listeners attached successfully!");
}

// Global function to close success popup
function closeSuccessPopup() {
    const successPopup = document.querySelector('.success-popup-overlay');
    if (successPopup) {
        successPopup.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(successPopup);
        }, 300);
    }
}

// CVV toggle function (global scope)
function toggleCVV() {
    const cvvInput = document.getElementById('cvv');
    const cvvToggle = document.querySelector('.cvv-toggle');

    if (cvvInput && cvvToggle) {
        if (cvvInput.type === 'password') {
            cvvInput.type = 'text';
            cvvToggle.classList.remove('fa-eye');
            cvvToggle.classList.add('fa-eye-slash');
        } else {
            cvvInput.type = 'password';
            cvvToggle.classList.remove('fa-eye-slash');
            cvvToggle.classList.add('fa-eye');
        }
    }
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

// For Odoo, also try with timeouts
setTimeout(initializePopup, 1000);
setTimeout(initializePopup, 2000);