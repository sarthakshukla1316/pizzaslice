require('dotenv').config();
const Order = require('../../../models/order')
const User = require('../../../models/user')
const moment = require('moment');
const mailSender = require('./mailSender');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
let springedge = require('springedge');


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

        async verifyOrder(req, res) {
            const {phone} = req.body;
            if(!phone) {
                req.flash('error1', 'Invalid phone');
                req.flash('phone', phone);
                return res.redirect('/cart');
            }

            Order.exists({ phone: phone }, async (err, result) => {         //   Check phone exists or not in DB
                if(result) {
                    if(result.isVerified === true) {
                        req.flash('error', 'Phone number already verified');
                        req.flash('phone', phone);
                        return res.redirect('/checkout');
                    }
                }
            })
            const otp = Math.floor(Math.random() * 1000000) + 10000;
            let order = new Order({
                customerId: req.user._id,
                phone: phone,
                otp: otp
            })
            
            let params = {
            'sender': process.env.SPRINGEDGE_SENDER,
            'apikey': process.env.SPRINGEDGE_SECRET_KEY,
            'to': [
                `91${phone}`  //Mobile Numbers 
            ],
            // 'message': `Hello ${user.name} , your verification code is ${otp}`,Hello, This is a test message from spring edge
            'message': `Hello ${otp} , This is a test message from spring edge`,
            'format': 'json'
            };
            
            springedge.messages.send(params, 5000, function (err, response) {
            if (err) {
                return console.log(err);
            }
            console.log(response);
            });
            
            
            await order.save().then((order) => {
                // Login 
                req.flash('phone', phone);
                req.flash('order_id', order._id);
                req.flash('success', 'A verification code has been sent on your phone number.');
                return res.redirect('/checkout');
            }).catch(err => {
                req.flash('error', 'Something went wrong');
                return res.redirect('/cart');
            })
        },

        async checkoutPage(req, res) {
            res.render('customers/checkout');
        },


        async store(req, res) {
            // console.log(req.body);

            const { order_id, phone, address, otp, stripeToken, paymentType } = req.body;            //  Validating request
            if(!order_id || !phone || !address || !otp) {
                // req.flash('error', 'All fields are required');
                // return res.redirect('/cart');
                return res.status(422).json({ message: 'All fields are required' });
            }

            let order = await Order.findById(order_id);
            
            if(order.otp !== otp) {
                await order.delete();
                req.flash('error1', 'Invalid otp');
                req.flash('order_id', order_id);
                req.flash('phone', phone);
                req.flash('address', address);
                return res.redirect('/checkout');
            }


            
            await Order.findByIdAndUpdate(order_id, {items: req.session.cart.items, address: address, price: req.session.cart.totalPrice < 400 ? req.session.cart.totalPrice + 20 : req.session.cart.totalPrice, isVerified: true}).then(result => {
                let markupCustomer = `
                    <div style="height: 50px; width: 100%; background: #59b256">
                        <h1 style="color: #fff; text-align: center; padding-top: 15px;">Order Summary</h1>
                    </div>
                    <img src="https://thumbs.dreamstime.com/b/mobile-shopping-app-modern-online-technology-internet-customer-service-icon-order-placed-processing-processed-metaphors-vector-184200609.jpg" alt="">
                    <h1>Thank you !! <br /> Order placed successfully</h1>
                    <p>Expected Delivery Time within 40 minutes</p>
                    <p>Payment method : ${paymentType === 'cod' ? 'Cash on Delivery' : 'Card'}</p>
                    <p>Price : Rs ${req.session.cart.totalPrice < 400 ? req.session.cart.totalPrice + 20 : req.session.cart.totalPrice}</p>
                `;
                const subjectCustomer = 'Pizza Slice - Order placed';
                const toEmailCustomer = req.user.email;
                mailSender(toEmailCustomer, markupCustomer, subjectCustomer);

                let markupAdmin = `
                    <div style="height: 50px; width: 100%; background: #59b256">
                        <h1 style="color: #fff; text-align: center; padding-top: 15px;">New Order</h1>
                    </div>
                    <img src="https://thumbs.dreamstime.com/b/mobile-shopping-app-modern-online-technology-internet-customer-service-icon-order-placed-processing-processed-metaphors-vector-184200609.jpg" alt="">
                    <h1>Congrats !! <br />New Order has been placed successfully</h1>
                    <p>Payment method : ${paymentType === 'cod' ? 'Cash on Delivery' : 'Card'}</p>
                    <p>Price : Rs ${req.session.cart.totalPrice < 400 ? req.session.cart.totalPrice + 20 : req.session.cart.totalPrice}</p>
                `;
                const subjectAdmin = `New Order placed by ${req.user.name}`;
                const toEmailAdmin = 'sarthakshukla1317@gmail.com';
                mailSender(toEmailAdmin, markupAdmin, subjectAdmin);
                
                Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
                    // req.flash('success', 'Order placed successfully');
                    

                    //   Stripe payment
                    if(paymentType === 'card') {
                        stripe.charges.create({
                            amount: (req.session.cart.totalPrice < 400 ? req.session.cart.totalPrice+20 : req.session.cart.totalPrice) * 100,
                            source: stripeToken,
                            currency: 'inr',
                            description: `Food order: ${placedOrder._id}`
                        }).then(() => {
                            placedOrder.paymentStatus = true;
                            placedOrder.paymentType = paymentType;
                            placedOrder.save().then((ord) => {
                                // console.log(ord);
                                //  Emit event
                                const eventEmitter = req.app.get('eventEmitter');
                                eventEmitter.emit('orderPlaced', ord);
                                delete req.session.cart;
                                return res.json({ message: 'Payment Successful, Order placed successfully' });
                            }).catch(err => {
                                console.log(err);
                            })
                        }).catch(err => {
                            delete req.session.cart;
                            return res.json({ message: 'Order placed successfully but Payment failed, You can pay at delivery time' });
                        })
                    } else {
                        delete req.session.cart;
                        return res.json({ message: 'Order placed successfully' });
                    }
                    
                    
                    // return res.redirect('/customer/orders');
                } )
            }).catch(err => {
                // req.flash('error', 'Something went wrong!!');
                // return res.redirect('/cart');
                return res.status(500).json({ message: 'Something went wrong!!' });
            })
        },





        // async store(req, res) {
        //     // console.log(req.body);

        //     const { phone, address, stripeToken, paymentType } = req.body;            //  Validating request
        //     if(!phone || !address) {
        //         // req.flash('error', 'All fields are required');
        //         // return res.redirect('/cart');
        //         return res.status(422).json({ message: 'All fields are required' });
        //     }

        //     const order = new Order({
        //         customerId: req.user._id,
        //         items: req.session.cart.items,
        //         phone,
        //         address,
        //         price: req.session.cart.totalPrice < 400 ? req.session.cart.totalPrice + 20 : req.session.cart.totalPrice
        //     });

            
        //     await order.save().then(result => {
        //         let markupCustomer = `
        //             <div style="height: 50px; width: 100%; background: #59b256">
        //                 <h1 style="color: #fff; text-align: center; padding-top: 15px;">Order Summary</h1>
        //             </div>
        //             <img src="https://thumbs.dreamstime.com/b/mobile-shopping-app-modern-online-technology-internet-customer-service-icon-order-placed-processing-processed-metaphors-vector-184200609.jpg" alt="">
        //             <h1>Thank you !! <br /> Order placed successfully</h1>
        //             <p>Expected Delivery Time within 40 minutes</p>
        //             <p>Payment method : ${paymentType === 'cod' ? 'Cash on Delivery' : 'Card'}</p>
        //             <p>Price : Rs ${order.price}</p>
        //         `;
        //         const subjectCustomer = 'Pizza Slice - Order placed';
        //         const toEmailCustomer = req.user.email;
        //         mailSender(toEmailCustomer, markupCustomer, subjectCustomer);

        //         let markupAdmin = `
        //             <div style="height: 50px; width: 100%; background: #59b256">
        //                 <h1 style="color: #fff; text-align: center; padding-top: 15px;">New Order</h1>
        //             </div>
        //             <img src="https://thumbs.dreamstime.com/b/mobile-shopping-app-modern-online-technology-internet-customer-service-icon-order-placed-processing-processed-metaphors-vector-184200609.jpg" alt="">
        //             <h1>Congrats !! <br />New Order has been placed successfully</h1>
        //             <p>Payment method : ${paymentType === 'cod' ? 'Cash on Delivery' : 'Card'}</p>
        //             <p>Price : Rs ${order.price}</p>
        //         `;
        //         const subjectAdmin = `New Order placed by ${req.user.name}`;
        //         const toEmailAdmin = 'sarthakshukla1317@gmail.com';
        //         mailSender(toEmailAdmin, markupAdmin, subjectAdmin);
                
        //         Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
        //             // req.flash('success', 'Order placed successfully');
                    

        //             //   Stripe payment
        //             if(paymentType === 'card') {
        //                 stripe.charges.create({
        //                     amount: (req.session.cart.totalPrice < 400 ? req.session.cart.totalPrice+20 : req.session.cart.totalPrice) * 100,
        //                     source: stripeToken,
        //                     currency: 'inr',
        //                     description: `Food order: ${placedOrder._id}`
        //                 }).then(() => {
        //                     placedOrder.paymentStatus = true;
        //                     placedOrder.paymentType = paymentType;
        //                     placedOrder.save().then((ord) => {
        //                         // console.log(ord);
        //                         //  Emit event
        //                         const eventEmitter = req.app.get('eventEmitter');
        //                         eventEmitter.emit('orderPlaced', ord);
        //                         delete req.session.cart;
        //                         return res.json({ message: 'Payment Successful, Order placed successfully' });
        //                     }).catch(err => {
        //                         console.log(err);
        //                     })
        //                 }).catch(err => {
        //                     delete req.session.cart;
        //                     return res.json({ message: 'Order placed successfully but Payment failed, You can pay at delivery time' });
        //                 })
        //             } else {
        //                 delete req.session.cart;
        //                 return res.json({ message: 'Order placed successfully' });
        //             }
                    
                    
        //             // return res.redirect('/customer/orders');
        //         } )
        //     }).catch(err => {
        //         // req.flash('error', 'Something went wrong!!');
        //         // return res.redirect('/cart');
        //         return res.status(500).json({ message: 'Something went wrong!!' });
        //     })
        // },

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