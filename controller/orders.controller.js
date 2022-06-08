const Order = require('../model/orders.model')

const orderController = {
    getAll: async(req, res) => {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1
            const limit = req.query.limit ? parseInt(req.query.limit) : 2

            const skip = (page - 1) * limit

            const data = await Order.find({}).skip(skip).limit(limit)

            const count = await Order.countDocuments({})
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
            const { userId, email, address, fullName, phoneNumber, cost, cart } = req.body
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
                email, fullName, address, phoneNumber, cost, products,
            })
            const result = await newOrder.save()
            res.status(200).json({
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
    updateStatusById: async(req, res) => {
        try {
            const { id } = req.params
            const { key, text } = req.body
           
            
            const result = await Order.findByIdAndUpdate(id,  {
                status: { key, text }
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
    }
}

module.exports = orderController
