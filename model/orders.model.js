const mongoose = require('mongoose')

const Schema = mongoose.Schema

const orderSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', require: true },
        quantity: { type: Number, default: 1 },
        price: { type: Number },
        totalItem: { type: Number }
    }],
    address: { type: String, required: true },
    email: { type: String },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    voucher: { type: String },
    cost: { 
        subTotal: { type: Number },
        discount: { type: Number },
        total: { type: Number },
     },
    status: {
        key: { type: Number, default: 0},
        text: { type: String, default: 'Đang chờ xử lý' }
        // 0: Đang chờ xử lý, 1: Đã đóng gói đơn hàng, 2: Đang vận chuyển, 3: Đã giao hàng
    }
  
}, {
    timestamps: true
})


module.exports = mongoose.model('Order', orderSchema)
