const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: { type: Object, required: false },
    phone: { type: String, required: true },
    address: { type: String, required: false },
    price: { type: String, required: false },
    otp: { type: String, required: true },
    isVerified: { type: String, required: true, default: 'false' },
    paymentType: { type: String, default: 'COD' },
    paymentStatus: { type: Boolean, default: false },
    status: { type: String, default: 'order_placed' }
}, 
{ timestamps: true }
)



module.exports = mongoose.model('Order', orderSchema);