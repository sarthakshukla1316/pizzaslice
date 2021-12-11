const Menu = require('../../../models/menu');
const Order = require('../../../models/order');


function foodController() {
    return {
        async index(req, res) {
            const foods = await Menu.find();
            // console.log(foods);
            return res.render('admin/menuItems', { foods: foods});
        },

        addFood(req, res) {
            return res.render('admin/addFood');
        },
        async postAddFood(req, res) {
            
            const food = new Menu({
                name: req.body.name,
                image: req.file.filename,
                price: req.body.price,
                size: req.body.size,
                stock: req.body.stock,
            })

            await food.save().then((food) => {
                req.flash('name', req.body.name);
                return res.redirect('/admin/menuItems');
            }).catch(err => {
                req.flash('error', 'Something went wrong');
                return res.redirect('/admin/add-food');
            })
        },

        updateFood(req, res) {
            if(req.query) {
                req.flash('name', req.query.name);
                return res.render('admin/updateFood', {name: req.query.name, price: req.query.price, size: req.query.size, stock: req.query.stock});
            }
            return res.render('admin/updateFood');
        },
        async postUpdateFood(req, res) {
            await Menu.updateOne({ name: req.body.name }, { name: req.body.newName, price: req.body.price, size: req.body.size, stock: req.body.stock, image: req.file.filename }, async (err, data) => {
                if(err) {
                    req.flash('error', 'Not able to update food Status');
                    return res.redirect('/admin/update-food');
                }

                return res.redirect('/admin/menuItems');
            })
        },

        async delete(req, res) {
            return res.render('admin/deleteFood', {name: req.query.name});
        },

        async postDelete(req, res) {
            let food = await Menu.findOne({ name: req.body.name})
            await food.delete();

            return res.redirect('/admin/menuItems');
            
        },

        async deleteOrder(req, res) {
            return res.render('admin/deleteOrder', {order_id: req.query.order_id});
        },

        async postDeleteOrder(req, res) {
            let order = await Order.findOne({ _id: req.body.order_id })
            await order.delete();

            return res.redirect('/admin/orders');
        }
    }
}


module.exports = foodController