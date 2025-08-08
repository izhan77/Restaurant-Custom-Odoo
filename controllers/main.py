from odoo import http
from odoo.http import request

class Kababjees(http.Controller):

    @http.route('/', type='http', auth='public', website=True)
    def index(self, **kw):
        # fetch a few products to display (change domain to your needs)
        products = request.env['product.template'].sudo().search([('sale_ok','=',True)], limit=6)
        return request.render('restaurant_custom.hero_section', {
            'products': products,
        })
