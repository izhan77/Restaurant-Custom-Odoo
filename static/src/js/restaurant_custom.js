console.log("Restaurant Custom JS loaded!");

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        initializeCheckoutHandlers();
    });

    function initializeCheckoutHandlers() {
        const paymentPopup = document.querySelector('.payment-popup');
        const paymentPopupOverlay = document.querySelector('.payment-popup-overlay');
        const closePaymentPopup = document.querySelector('.close-payment-popup');
        const confirmPaymentBtn = document.querySelector('.confirm-payment-btn');
        const cartSidebar = document.querySelector('.cart-sidebar');

        // Delegated listener for checkout button
        document.body.addEventListener('click', function (e) {
            if (e.target && e.target.id === 'checkout-button') {
                e.preventDefault();
                console.log("Checkout button clicked");

                const cartItems = document.querySelectorAll('.cart-item');
                if (cartItems.length === 0) {
                    showNotification('Your cart is empty!', 'error');
                    return;
                }

                if (cartSidebar) {
                    cartSidebar.style.display = 'none';
                }

                showPaymentPopup();
            }
        });

        // Close popup
        if (closePaymentPopup) {
            closePaymentPopup.addEventListener('click', hidePaymentPopup);
        }

        if (paymentPopupOverlay) {
            paymentPopupOverlay.addEventListener('click', hidePaymentPopup);
        }

        // Confirm payment
        if (confirmPaymentBtn) {
            confirmPaymentBtn.addEventListener('click', function (e) {
                e.preventDefault();
                handlePaymentConfirmation();
            });
        }

        // Payment method selection
        const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', updatePaymentMethod);
        });
    }

    function showPaymentPopup() {
        const paymentPopup = document.querySelector('.payment-popup');
        if (paymentPopup) {
            paymentPopup.style.display = 'flex';
            setTimeout(() => {
                paymentPopup.classList.add('show');
            }, 10);
        }
    }

    function hidePaymentPopup() {
        const paymentPopup = document.querySelector('.payment-popup');
        if (paymentPopup) {
            paymentPopup.classList.remove('show');
            setTimeout(() => {
                paymentPopup.style.display = 'none';
            }, 300);
        }
    }

    function updatePaymentMethod() {
        const selectedMethod = document.querySelector('input[name="payment-method"]:checked');
        if (selectedMethod) {
            console.log('Selected payment method:', selectedMethod.id);
            updatePaymentMethodUI(selectedMethod.id);
        }
    }

    function updatePaymentMethodUI(methodId) {
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(method => method.classList.remove('selected'));

        const selectedContainer = document.querySelector(`#${methodId}`)?.closest('.payment-method');
        if (selectedContainer) {
            selectedContainer.classList.add('selected');
        }
    }

    function handlePaymentConfirmation() {
        const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked');

        if (!selectedPaymentMethod) {
            showNotification('Please select a payment method!', 'error');
            return;
        }

        const confirmBtn = document.querySelector('.confirm-payment-btn');
        const originalText = confirmBtn.textContent;
        confirmBtn.textContent = 'Processing...';
        confirmBtn.disabled = true;

        const cartData = getCartData();

        submitOrderWithPayment(selectedPaymentMethod.id, cartData)
            .then(result => {
                hidePaymentPopup();
                showNotification('Order placed successfully!', 'success');
                clearCart();

                if (result.order_id) {
                    window.location.href = `/shop/order/${result.order_id}`;
                }
            })
            .catch(error => {
                console.error('Payment failed:', error);
                showNotification(error.message || 'Payment failed. Please try again.', 'error');
            })
            .finally(() => {
                confirmBtn.textContent = originalText;
                confirmBtn.disabled = false;
            });
    }

    function getCartData() {
        const cartItems = [];
        const cartItemElements = document.querySelectorAll('.cart-item');

        cartItemElements.forEach(item => {
            const name = item.querySelector('.cart-item-details h4')?.textContent || '';
            const price = item.querySelector('.cart-item-price')?.textContent.replace('Rs. ', '') || '0';
            const quantity = item.querySelector('.cart-item-qty')?.textContent || '1';
            const size = item.querySelector('.cart-item-details p')?.textContent.replace(/[()]/g, '') || '';

            cartItems.push({
                name,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                size,
                product_id: item.getAttribute('data-product-id') || null
            });
        });

        return {
            items: cartItems,
            total: calculateCartTotal(),
            tax: calculateTax()
        };
    }

    function calculateCartTotal() {
        let total = 0;
        document.querySelectorAll('.cart-item').forEach(item => {
            const price = parseFloat(item.querySelector('.cart-item-price')?.textContent.replace('Rs. ', '') || '0');
            const quantity = parseInt(item.querySelector('.cart-item-qty')?.textContent || '1');
            total += price * quantity;
        });
        return total;
    }

    function calculateTax() {
        const subtotal = calculateCartTotal();
        return Math.round(subtotal * 0.15); // 15% tax
    }

    function submitOrderWithPayment(paymentMethod, cartData) {
        const state = {
            cartItems: cartData.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
                notes: item.size ? `Size: ${item.size}` : ''
            }))
        };

        if (typeof submitOrder === 'function') {
            return submitOrder.call(this, paymentMethod);
        } else {
            return new Promise((resolve) => {
                console.log('Submitting order:', { paymentMethod, cartData });

                setTimeout(() => {
                    resolve({
                        order_id: Math.random().toString(36).substr(2, 9),
                        order_number: 'ORD-' + Date.now()
                    });
                }, 2000);
            });
        }
    }

    function clearCart() {
        const cartItems = document.querySelector('.cart-items');
        if (cartItems) cartItems.innerHTML = '';

        const bottomCartBar = document.querySelector('.bottom-cart-bar');
        if (bottomCartBar) bottomCartBar.style.display = 'none';

        const cartCount = document.querySelector('.cart-count');
        if (cartCount) cartCount.textContent = '0';
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            });
        }
    }

    // Expose functions globally (optional)
    window.restaurantApp = {
        showPaymentPopup,
        hidePaymentPopup,
        handlePaymentConfirmation,
        getCartData,
        submitOrderWithPayment
    };

})();
