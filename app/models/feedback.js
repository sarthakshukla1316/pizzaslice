const mongoose = require('mongoose')
const Schema = mongoose.Schema

const feedbackSchema = new Schema({
    order_id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    quality: { type: String, required: true },
    clean: { type: String, required: true },
    speed: { type: String, required: true },
    overall: { type: String, required: true },
    comment: { type: String, required: true }
})


module.exports = mongoose.model('Feedback', feedbackSchema);;