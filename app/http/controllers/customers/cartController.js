function cartController() {
    return {
        index(req, res) {
            res.render('customers/cart');
        },
        update(req, res) {
            // let cart = {
            //     items: {
            //         foodId: { item: foodObject, qty: 0 },
            //     },
            //     totalQty: 0,
            //     totalPrice: 0
            // }
            
            if (!req.session.cart) {    // first time creating cart
                req.session.cart = {
                    items: {},
                    totalQty: 0,
                    totalPrice: 0
                }
            }

            let cart = req.session.cart;

            if(!cart.items[req.body._id]) {      // check if item exist in cart or not
                cart.items[req.body._id] = {
                    item: req.body,
                    qty: 1
                }
                cart.totalQty = cart.totalQty + 1;
                cart.totalPrice = cart.totalPrice + req.body.price;
            }
            else {
                cart.items[req.body._id].qty = cart.items[req.body._id].qty + 1;
                cart.totalQty = cart.totalQty + 1;
                cart.totalPrice = cart.totalPrice + req.body.price;
            }

            return res.json({ totalQty: req.session.cart.totalQty});
        },

        emptyFullCart(req, res) {
            if(req.session.cart) {
                delete req.session.cart;
                return res.redirect('/cart');
            } else {
                return;
            }
        }

        // delete(req, res) {
        //     let cart = req.session.cart;
        //     let id = req.body.foodId;
        //     if(cart.items[id]) {
        //         cart.items[id].qty = cart.items[id].qty - 1;
        //         cart.totalQty = cart.totalQty - 1;
        //         cart.totalPrice = cart.totalPrice - cart.items[id].item.price;
        //         if(cart.items[id].qty === 0) {
        //             delete cart.items.id;
        //         }
        //     }

        //     return res.json({ success: 'Item deleted successfully'});
        // }
    }
}



module.exports = cartController