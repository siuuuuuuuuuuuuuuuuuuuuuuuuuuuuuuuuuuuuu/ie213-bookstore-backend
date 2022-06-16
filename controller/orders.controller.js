const Order = require('../model/orders.model')
const Voucher = require('../model/vouchers.model')

const orderController = {
    getAll: async(req, res) => {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1
            const limit = req.query.limit ? parseInt(req.query.limit) : 2
            const sortByDate = req.query.sortByDate
            const userId = req.query.userId
            const skip = (page - 1) * limit

            let query = {}
            if (userId) query.user = { $in : userId}

            let sort = {}
            if (sortByDate) sort.createdAt = sortByDate === "asc" ? 1 : -1
            const data = await Order.find(query).skip(skip).limit(limit).sort(sort)

            const count = await Order.countDocuments(query)
            const totalPage = Math.ceil(count / limit)

            res.status(200).json({
                message: 'success',
                error: 0,
                data,
                count,
                pagination: {
                    page,
                    limit,
                    totalPage,
                }
            })
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    getById: async(req, res) => {
        try {
            const { id } = req.params
            const data = await Order.findById(id).populate("user").populate("products.product")
            if (data) {
                res.status(200).json({
                    message: 'success',
                    error: 0,
                    data
                })
            } else {
                res.status(200).json({
                    message: 'Không tìm thấy đơn hàng!',
                    error: 1,
                    data: {}
                })
            }
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    create: async(req, res) => {
        try {
            const { userId, email, address, fullName, phoneNumber, voucher, cost, cart, method } = req.body
            if (voucher) {
                const checkVoucher = await Voucher.findOne({code: voucher})
                if (!checkVoucher) {
                    return res.status(400).json({
                        message: `Voucher này không tồn tại!`,
                        error: 1,
                    })
                }
                  
                if (checkVoucher.used_quantity >= checkVoucher.quantity) {
                    return res.status(400).json({
                        message: `Số lượng sử dụng voucher này đã hết!`,
                        error: 1,
                    })
                }
            }
            const products = cart.map((product) => {
                return {
                    product: product._id,
                    quantity: product.quantity,
                    price: product.price,
                    totalItem: product.totalPriceItem
                }
            })
            const newOrder = new Order({
                user: userId ? userId : null, 
                email, fullName, address, phoneNumber, voucher, cost, products, method
            })
            const result = await newOrder.save()
            await Voucher.updateOne(
                { code: voucher },
                { $inc: { used_quantity: 1 } }
            )
            return res.status(200).json({
                message: 'success',
                error: 0,
                // data: result
            })
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    updatePaymentStatusById: async(req, res) => {
        try {
            const { id } = req.params
            const { paymentStatus } = req.body

            const result = await Order.findByIdAndUpdate(id,  {
                isPaid: paymentStatus
            }, {new: true})
            res.status(200).json({
                message: 'success',
                error: 0,
                data: result
            })
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    updateStatusById: async(req, res) => {
        try {
            const { id } = req.params
            const { key, text } = req.body
           
            const order = await Order.findById(id)
            let paymentStatus = order.isPaid

            if (order.method === 0) {
                paymentStatus = key === 3 ? true : false
            }

            const result = await Order.findByIdAndUpdate(id,  {
                status: { key, text },
                isPaid: paymentStatus
            }, {new: true})
            res.status(200).json({
                message: 'success',
                error: 0,
                data: result
            })
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    deleteById: async(req, res) => {
        try {
            const { id } = req.params
            const result = await Order.findByIdAndDelete(id)
            if (result) {
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: result
                })
            } else {
                return res.status(400).json({
                    message: `Không tìm thấy đơn hàng có id: ${id}`,
                    error: 1,
                    data: result
                })
            }
            
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
}

module.exports = orderController
