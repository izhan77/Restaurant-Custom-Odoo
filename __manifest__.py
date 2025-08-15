{
    'name': 'Restaurant Custom',
    'author': 'eaaxeesoft',
    'category': 'Website',
    'license': 'LGPL-3',
    'version': '1.0',
    'depends': ['website'],
    'data': [
        # 'views/assets.xml',
        'views/hero_section.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            '/restaurant_custom/static/src/css/hero.css',
            '/restaurant_custom/static/src/css/popular_items.css',
            '/restaurant_custom/static/src/js/hero.js',
        ],
    },
    'installable': True,
    'application': False,
}