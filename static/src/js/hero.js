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

    console.log("Elements found:", {
        menuCard: !!menuCard,
        popup: !!popup,
        closeBtn: !!closeBtn,
        sizeOptions: sizeOptions.length,
        quantityElement: !!quantityElement,
        minusBtn: !!minusBtn,
        plusBtn: !!plusBtn
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