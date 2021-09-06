const authController = require("../app/http/controllers/authController.js");
const cartController = require("../app/http/controllers/customers/cartController.js");
const orderController = require("../app/http/controllers/customers/orderController.js");
const homeController = require("../app/http/controllers/homeController.js");

const adminOrderController = require("../app/http/controllers/admin/orderController.js");      //  Admin 
const statusController = require("../app/http/controllers/admin/statusController.js");
const successfulOrderController = require("../app/http/controllers/admin/successfulOrderController.js");

const guest = require('../app/http/middlewares/guest');      //   Middlewares 
const auth = require('../app/http/middlewares/auth');
const admin = require('../app/http/middlewares/admin');


function initRoutes(app) {

    app.get('/', homeController().index);
    
    
    app.get('/login', guest, authController().login);
    app.post('/login', authController().postLogin);
    

    app.get('/register', guest, authController().register);
    app.post('/register', authController().postRegister);


    app.post('/logout', authController().logout);


    app.get('/cart', cartController().index);                      //   Customer routes
    app.post('/update-cart', cartController().update);
    // app.post('/delete-cart', cartController().delete);


    app.get('/customer/orders', auth, orderController().index);                //   Customer routes
    app.post('/orders', auth, orderController().store);

    app.get('/customer/orders/:id', auth, orderController().show);


    app.get('/admin/orders', admin, adminOrderController().index);           //    Admin routes
    app.post('/admin/order/status', admin, statusController().update);

    app.get('/admin/successfulOrders', admin, successfulOrderController().index);
    
}


module.exports = initRoutes