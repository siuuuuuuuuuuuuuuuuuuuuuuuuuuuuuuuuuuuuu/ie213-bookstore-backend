const mongoose = require('mongoose')

const Schema = mongoose.Schema

const orderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', require: true },
        quantity: { type: Number, default: 1 },
        price: { type: Number },
        totalItem: { type: Number }
    }],
    address: { type: String, required: true },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    total: { type: Number, required: true },
    status: {
        key: { type: Number, default: 0},
        text: { type: String, default: 'Đang chờ xử lý' }
        // 0: Đang chờ xử lý, 1: Đã nhận được đơn hàng, 3: Đang vận chuyển, 4: Đã giao hàng
    }
  
}, {
    timestamps: true
})


module.exports = mongoose.model('Order', orderSchema)
