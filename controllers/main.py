from odoo import http
from odoo.http import request, Response
import json
from twilio.rest import Client
import logging
# from werkzeug.exceptions import BadRequest

_logger = logging.getLogger(__name__)


class KababjeesController(http.Controller):

    @http.route('/test-sms', type='http', auth="public")
    def test_sms(self, **kw):
        try:
            config = request.env['ir.config_parameter'].sudo()
            account_sid = config.get_param('twilio.account_sid')
            auth_token = config.get_param('twilio.auth_token')
            twilio_number = config.get_param('twilio.twilio_number')

            return f"""
            <h1>Twilio Test</h1>
            <p>Account SID: {'Configured' if account_sid else 'Missing'}</p>
            <p>Auth Token: {'Configured' if auth_token else 'Missing'}</p>
            <p>Twilio Number: {'Configured' if twilio_number else 'Missing'}</p>
            """
        except Exception as e:
            return str(e)

    @http.route('/kababjees/send_sms', type='json', auth="public", methods=['POST'], csrf=False)
    def send_sms(self, **post):
        _logger.info("SMS request received")
        try:
            # Get data from request
            data = request.jsonrequest
            _logger.debug("Request data: %s", data)
            if not data:
                return {'success': False, 'error': 'No data received'}

            phone = data.get('phone')
            message = data.get('message')

            if not phone or not message:
                return {
                    'success': False,
                    'error': 'Phone and message are required'
                }

            # Get Twilio credentials
            config = request.env['ir.config_parameter'].sudo()
            account_sid = config.get_param('twilio.account_sid')
            auth_token = config.get_param('twilio.auth_token')
            twilio_number = config.get_param('twilio.twilio_number')

            if not all([account_sid, auth_token, twilio_number]):
                return {
                    'success': False,
                    'error': 'Twilio not configured'
                }

            # Initialize Twilio client
            client = Client(account_sid, auth_token)

            # Send SMS
            message = client.messages.create(
                body=message,
                from_=twilio_number,
                to=phone
            )

            return {
                'success': True,
                'sid': message.sid,
                'status': message.status
            }

        except Exception as e:
            _logger.error("SMS sending failed: %s", str(e))
            return {
                'success': False,
                'error': str(e)
            }

    @http.route('/', type='http', auth='public', website=True)
    def index(self, **kw):
        """
        Homepage route displaying featured products
        """
        try:
            products = request.env['product.template'].sudo().search([
                ('sale_ok', '=', True),
                ('is_published', '=', True)
            ], limit=6)

            return request.render('restaurant_custom.hero_section', {
                'products': products,
                'show_checkout': False
            })
        except Exception as e:
            _logger.error("Error rendering homepage: %s", str(e))
            return request.render('restaurant_custom.error_page', {
                'error': 'Unable to load products. Please try again later.'
            })

    @http.route('/checkout', type='http', auth='public', website=True)
    def checkout_page(self, **kw):
        """
        Dedicated checkout page route
        """
        return request.render('restaurant_custom.checkout_page', {
            'show_checkout': True
        })

    @http.route('/api/place_order', type='json', auth='public', methods=['POST'], csrf=False)
    def place_order(self, **kw):
        """
        API endpoint to process order placement
        """
        try:
            order_data = request.jsonrequest
            _logger.info("Order data received: %s", order_data)

            # Validate required fields
            required_fields = ['firstName', 'lastName', 'phone', 'address']
            customer_data = order_data.get('customer', {})

            missing_fields = [field for field in required_fields if not customer_data.get(field)]
            if missing_fields:
                raise BadRequest(f"Missing required fields: {', '.join(missing_fields)}")

            if not order_data.get('items'):
                raise BadRequest("No items in the order")

            # Create or get customer
            partner = self._create_or_get_partner(customer_data)

            # Create sales order
            order = self._create_sales_order(partner, order_data)

            # Process payment if online payment was selected
            if order_data.get('payment', {}).get('method') == 'card':
                payment_success = self._process_payment(
                    order_data.get('payment', {}).get('cardDetails', {}),
                    order.amount_total
                )
                if not payment_success:
                    raise BadRequest("Payment processing failed")

            # Confirm order
            order.action_confirm()

            # Generate order ID and prepare response
            order_id = f"KB{order.id}"
            return {
                'success': True,
                'order_id': order_id,
                'message': 'Order placed successfully!'
            }

        except BadRequest as e:
            _logger.warning("Bad request: %s", str(e))
            return {
                'success': False,
                'error': str(e)
            }
        except Exception as e:
            _logger.error("Error placing order: %s", str(e))
            return {
                'success': False,
                'error': 'An error occurred while processing your order'
            }

    @http.route('/api/validate_promo', type='json', auth='public', methods=['POST'], csrf=False)
    def validate_promo_code(self, **kw):
        """
        Validate promo code and calculate discount
        """
        try:
            data = request.jsonrequest
            promo_code = data.get('promo_code', '').strip().upper()
            subtotal = float(data.get('subtotal', 0))

            if not promo_code:
                raise BadRequest("Please enter a promo code")

            # Check promo code in database
            promo = request.env['sale.coupon.program'].sudo().search([
                ('name', '=', promo_code),
                ('active', '=', True)
            ], limit=1)

            if not promo:
                raise BadRequest("Invalid promo code")

            # Calculate discount based on promo type
            discount_amount = 0
            if promo.discount_type == 'percentage':
                discount_amount = subtotal * (promo.discount_percentage / 100)
            elif promo.discount_type == 'fixed_amount':
                discount_amount = promo.discount_fixed_amount
            elif promo.discount_type == 'free_delivery':
                discount_amount = 150  # Standard delivery fee

            return {
                'success': True,
                'discount': {
                    'code': promo_code,
                    'amount': discount_amount,
                    'type': promo.discount_type
                },
                'message': 'Promo code applied successfully!'
            }

        except BadRequest as e:
            return {
                'success': False,
                'error': str(e)
            }
        except Exception as e:
            _logger.error("Error validating promo: %s", str(e))
            return {
                'success': False,
                'error': 'Error validating promo code'
            }

    @http.route('/api/cart', type='json', auth='public', methods=['GET', 'POST'], csrf=False)
    def handle_cart(self, **kw):
        """
        Handle cart operations (get/update)
        """
        try:
            if request.httprequest.method == 'GET':
                # Get current cart from session
                cart = request.session.get('kababjees_cart', [])
                return {
                    'success': True,
                    'cart': cart
                }
            else:
                # Update cart
                cart_data = request.jsonrequest.get('cart', [])
                request.session['kababjees_cart'] = cart_data
                return {
                    'success': True,
                    'message': 'Cart updated'
                }
        except Exception as e:
            _logger.error("Error handling cart: %s", str(e))
            return {
                'success': False,
                'error': 'Error processing cart'
            }

    @http.route('/menu', type='http', auth='public', website=True)
    def menu_page(self, **kw):
        """
        Full menu page with categories
        """
        try:
            categories = request.env['product.public.category'].sudo().search([])
            products = request.env['product.template'].sudo().search([
                ('sale_ok', '=', True),
                ('is_published', '=', True)
            ])

            return request.render('restaurant_custom.menu_page', {
                'categories': categories,
                'products': products
            })
        except Exception as e:
            _logger.error("Error loading menu: %s", str(e))
            return request.render('restaurant_custom.error_page', {
                'error': 'Unable to load menu. Please try again later.'
            })

    @http.route('/about', type='http', auth='public', website=True)
    def about_page(self, **kw):
        """
        About us page
        """
        return request.render('restaurant_custom.about_page')

    @http.route('/contact', type='http', auth='public', website=True)
    def contact_page(self, **kw):
        """
        Contact us page
        """
        return request.render('restaurant_custom.contact_page')

    @http.route('/submit_contact', type='http', auth='public', website=True, methods=['POST'])
    def submit_contact(self, **kw):
        """
        Handle contact form submission
        """
        try:
            name = kw.get('name', '').strip()
            email = kw.get('email', '').strip()
            phone = kw.get('phone', '').strip()
            message = kw.get('message', '').strip()

            # Validate required fields
            if not name or not message:
                return request.render('restaurant_custom.contact_page', {
                    'error': 'Name and message are required',
                    'name': name,
                    'email': email,
                    'phone': phone,
                    'message': message
                })

            # Create a mail.message or lead record
            request.env['mail.message'].sudo().create({
                'model': 'website',
                'body': f"Contact Form Submission\n\nName: {name}\nEmail: {email}\nPhone: {phone}\nMessage: {message}",
                'message_type': 'comment'
            })

            return request.render('restaurant_custom.contact_thankyou', {
                'message': 'Thank you for contacting us! We will get back to you soon.'
            })

        except Exception as e:
            _logger.error("Error submitting contact form: %s", str(e))
            return request.render('restaurant_custom.contact_page', {
                'error': 'An error occurred. Please try again.',
                'name': name,
                'email': email,
                'phone': phone,
                'message': message
            })

    def _create_or_get_partner(self, customer_data):
        """
        Helper method to create or get existing customer
        """
        Partner = request.env['res.partner'].sudo()

        # Search by email or phone
        domain = ['|']
        if customer_data.get('email'):
            domain.append(('email', '=', customer_data['email']))
        if customer_data.get('phone'):
            domain.append(('phone', '=', customer_data['phone']))

        partner = Partner.search(domain, limit=1)

        if not partner:
            # Create new partner
            partner_vals = {
                'name': f"{customer_data.get('firstName', '')} {customer_data.get('lastName', '')}".strip(),
                'phone': customer_data.get('phone'),
                'email': customer_data.get('email'),
                'street': customer_data.get('address'),
                'is_company': False,
                'customer_rank': 1,
                'type': 'contact'
            }
            partner = Partner.create(partner_vals)

        return partner

    def _create_sales_order(self, partner, order_data):
        """
        Helper method to create sales order
        """
        SaleOrder = request.env['sale.order'].sudo()

        # Prepare order values
        order_vals = {
            'partner_id': partner.id,
            'partner_invoice_id': partner.id,
            'partner_shipping_id': partner.id,
            'note': order_data.get('instructions', ''),
            'payment_term_id': request.env.ref('account.account_payment_term_immediate').id,
        }

        order = SaleOrder.create(order_vals)

        # Add order lines
        for item in order_data.get('items', []):
            product = self._get_or_create_product(item)

            line_vals = {
                'order_id': order.id,
                'product_id': product.id,
                'product_uom_qty': item.get('quantity', 1),
                'price_unit': item.get('price', 0),
                'name': f"{item.get('name', '')} ({item.get('size', '')}",
            }

            request.env['sale.order.line'].sudo().create(line_vals)

        # Add delivery fee if applicable
        delivery_fee = order_data.get('totals', {}).get('deliveryFee', 0)
        if delivery_fee > 0:
            delivery_product = self._get_delivery_product()
            if delivery_product:
                line_vals = {
                    'order_id': order.id,
                    'product_id': delivery_product.id,
                    'product_uom_qty': 1,
                    'price_unit': delivery_fee,
                    'name': 'Delivery Charges',
                }
                request.env['sale.order.line'].sudo().create(line_vals)

        return order

    def _get_or_create_product(self, item_data):
        """
        Helper method to get or create product
        """
        Product = request.env['product.product'].sudo()

        # Try to find product by name
        product = Product.search([
            ('name', 'ilike', item_data.get('name', '')),
            ('sale_ok', '=', True)
        ], limit=1)

        if not product:
            # Create new product
            product_vals = {
                'name': item_data.get('name', 'Unknown Item'),
                'list_price': item_data.get('price', 0),
                'type': 'consu',
                'sale_ok': True,
                'purchase_ok': False,
                'available_in_pos': True,
            }
            product = Product.create(product_vals)

        return product

    def _get_delivery_product(self):
        """
        Helper method to get or create delivery product
        """
        Product = request.env['product.product'].sudo()

        delivery_product = Product.search([
            ('name', '=', 'Delivery Charges'),
            ('type', '=', 'service')
        ], limit=1)

        if not delivery_product:
            delivery_vals = {
                'name': 'Delivery Charges',
                'list_price': 150,
                'type': 'service',
                'sale_ok': True,
                'purchase_ok': False,
                'available_in_pos': True,
            }
            delivery_product = Product.create(delivery_vals)

        return delivery_product

    def _process_payment(self, card_data, amount):
        """
        Helper method to process payment (simplified)
        """
        # In a real implementation, integrate with payment gateway
        _logger.info(f"Processing payment of {amount} with card ending in {card_data.get('number', '')[-4:]}")
        return True  # Simulate successful payment


