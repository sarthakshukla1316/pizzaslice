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
const foodController = require("../app/http/controllers/admin/foodController.js");

const Menu = require('../app/models/menu');

const multer = require('multer');

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/img/'),
    filename: (req, file, cb) => {
        // const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        const uniqueName = file.fieldname+"_"+Date.now()+"_"+file.originalname;
        cb(null, uniqueName);
    }
})

let upload = multer({
    storage: storage, 
    limit: { fileSize: 100000 * 100}
}).single("image");
function initRoutes(app) {

    app.get('/', homeController().index);
    
    
    app.get('/login', guest, authController().login);
    app.post('/login', authController().postLogin);

    app.get('/sendOtp', authController().sendOtp);
    app.post('/sendOtp', authController().postSendOtp);
    app.post('/sendOtpPhone', authController().postSendOtpPhone);

    app.get('/otpVerify', guest, authController().otpVerification);
    app.post('/otpVerify', authController().postOtpVerification);
    app.post('/otpVerifyPhone', authController().postOtpVerificationPhone);


    app.get('/register', guest, authController().register);
    app.post('/register', authController().postRegister);


    app.post('/logout', authController().logout);


    app.get('/cart', cartController().index);                      //   Customer routes
    app.post('/update-cart', cartController().update);

    // app.post('/delete-cart', cartController().delete);
    app.post('/emptyCart', cartController().emptyFullCart);


    app.get('/customer/orders', auth, orderController().index);                //   Customer routes

    app.post('/order-verify', auth, orderController().verifyOrder);

    app.get('/checkout', auth, orderController().checkoutPage);
    app.post('/orders', auth, orderController().store);

    app.get('/customer/orders/:id', auth, orderController().show);


    app.get('/admin/orders', admin, adminOrderController().index);           //    Admin routes
    app.post('/admin/order/status', admin, statusController().update);
    // app.post('/admin/food/changeStock', admin, statusController().update);

    app.get('/admin/successfulOrders', admin, successfulOrderController().index);

    app.get('/admin/menuItems', admin, foodController().index);

    app.get('/admin/add-food', admin, foodController().addFood);
    app.post('/admin/add-food', admin, upload, foodController().postAddFood);

    app.get('/admin/update-food', admin, foodController().updateFood);
    app.post('/admin/update-food', admin, upload, foodController().postUpdateFood);

    app.get('/admin/delete-food', admin, foodController().delete);
    app.post('/admin/delete-food', admin, foodController().postDelete);
    
}


module.exports = initRoutes