document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuClose = document.querySelector('.mobile-menu-close');
    const menuOverlay = document.querySelector('.mobile-menu-overlay');

    // Check if elements exist
    if (!menuToggle || !mobileMenu) {
        console.error("Menu elements missing!");
        return;
    }

    // Open menu function
    function openMenu() {
        mobileMenu.classList.add('menu-open');
        menuOverlay.classList.add('overlay-active');
        document.body.classList.add('menu-open-no-scroll');
        menuToggle.setAttribute('aria-expanded', 'true');
    }

    // Close menu function
    function closeMenu() {
        mobileMenu.classList.remove('menu-open');
        menuOverlay.classList.remove('overlay-active');
        document.body.classList.remove('menu-open-no-scroll');
        menuToggle.setAttribute('aria-expanded', 'false');
    }

    // Toggle menu
    menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        if (mobileMenu.classList.contains('menu-open')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu events
    if (menuClose) menuClose.addEventListener('click', closeMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && mobileMenu.classList.contains('menu-open')) {
            closeMenu();
        }
    });

    // Close on resize if desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
});