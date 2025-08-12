{
    'name': 'Restaurant Custom',
    'author': 'eaaxeesoft',
    'category': 'Website',
    'license': 'LGPL-3',
    'version': '1.0',
    'depends': ['website', 'base'],
    'controllers': [
        'controllers/main.py',
    ],
    'data': [
        'views/hero_section.xml',
        'views/error_page.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'restaurant_custom/static/src/css/navbar.css',
            'restaurant_custom/static/src/js/navbar.js',
            'restaurant_custom/static/src/css/hero.css',
            'restaurant_custom/static/src/js/hero.js',
        ],
    },
    'installable': True,
    'application': False,
}
