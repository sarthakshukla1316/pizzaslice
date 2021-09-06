const Order = require('../../../models/order');
const moment = require('moment');


function successfulOrderController() {
    return {
        async index(req, res) {
            await Order.find({ status: 'completed' }, null, { sort: { 'createdAt': -1 } } )
            .populate('customerId', '-password')
            .exec((err, orders) => {

                return res.render('admin/successfulOrders', { orders: orders, moment: moment } );
            })
        }
    }
}



module.exports = successfulOrderController