{
    'name': 'Restaurant Custom',
    'author': 'eaaxeesoft',
    'category': 'Website',
    'license': 'LGPL-3',
    'version': '1.0',
    'depends': ['website'],
    'data': [
        'views/hero_section.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            # CSS
            'restaurant_custom/static/src/css/hero.css',
            'restaurant_custom/static/src/css/footer.css',
            'restaurant_custom/static/src/css/navbar.css',
            'restaurant_custom/static/src/css/payment_popup.css',
            # JS
            'restaurant_custom/static/src/js/hero.js',
            'restaurant_custom/static/src/js/restaurant_custom.js',
        ],
    },
    'images': [
        'static/description/banner.png',
    ],
    'installable': True,
    'application': False,
}
