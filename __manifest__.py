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
            '/restaurant_custom/static/src/css/hero.css',
            '/restaurant_custom/static/src/js/hero.js',
            '/restaurant_custom/static/src/css/navbar.css',
        ],
    },
    'installable': True,
    'application': False,
}
