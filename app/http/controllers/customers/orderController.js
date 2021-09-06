const Order = require('../../../models/order')
const moment = require('moment')



function orderController() {
    return {
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id }, 
                null, 
                { sort: { 'createdAt': -1}});
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            // console.log(orders);
            return res.render('customers/orders', { orders: orders, moment: moment });
        },

        async store(req, res) {
            // console.log(req.body);

            const { phone, address } = req.body;            //  Validating request
            if(!phone || !address) {
                req.flash('error', 'All fields are required');
                return res.redirect('/cart');
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address
            })

            await order.save().then(result => {
                Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {

                    req.flash('success', 'Order placed successfully');
                    delete req.session.cart;
    
                    //  Emit event
                    const eventEmitter = req.app.get('eventEmitter');
                    eventEmitter.emit('orderPlaced', placedOrder);
    
                    return res.redirect('/customer/orders');
                } )
            }).catch(err => {
                req.flash('error', 'Something went wrong!!');
                return res.redirect('/cart');
            })
        },

        async show(req, res) {
            const order = await Order.findById(req.params.id);

            // Authorize user
            if(req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder', { order: order });
            } 

            return res.redirect('/');
        }
    }
}



module.exports = orderController