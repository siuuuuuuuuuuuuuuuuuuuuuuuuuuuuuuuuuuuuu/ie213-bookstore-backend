const Voucher = require('../model/vouchers.model')

const voucherController = {
    getAll: async(req, res) => {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1
            const limit = req.query.limit ? parseInt(req.query.limit) : 5
            const sortByDate = req.query.sortByDate
            const canUse = req.query.canUse

            let sort = {}
            let query = {}
            if (sortByDate) sort.createdAt = sortByDate === "asc" ? 1 : -1
            if (canUse) query["$expr"] = { $lt: [ "$used_quantity" , "$quantity" ] } 
            const skip = (page - 1) * limit

            const data = await Voucher.find(query).skip(skip).limit(limit).sort(sort)
            const count = await Voucher.countDocuments(query)
            const totalPage = Math.ceil(count / limit)
            res.status(200).json({
                message: 'success',
                error: 0,
                count,
                data,
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
            const data = await Voucher.findById(id)
            if (data) {
                res.status(200).json({
                    message: 'success',
                    error: 0,
                    data,
                })
            } else {
                res.status(200).json({
                    message: 'Không tìm thấy!',
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
    getByCode: async(req, res) => {
        try {
            const { code } = req.params
            const data = await Voucher.findOne({code: code})
            if (data) {
                res.status(200).json({
                    message: 'success',
                    error: 0,
                    data,
                })
            } else {
                res.status(200).json({
                    message: 'Không tìm thấy!',
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
            const { price_request, code, discount, quantity } = req.body
            const newVoucher = new Voucher({price_request, code, discount, quantity})
            const result = await newVoucher.save()
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
    updateById: async(req, res) => {
        try {
            const { price_request, discount, quantity } = req.body
            const { id } = req.params
            const result = await Voucher.findByIdAndUpdate(id, {
                price_request, discount, quantity
            }, {new: true})
            if (result) {
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: result
                })
            } else {
                return res.status(400).json({
                    message: `Không tìm thấy id:${id}`,
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
    deleteById: async(req, res) => {
        try {
            const { id } = req.params
            const result = await Voucher.findByIdAndDelete(id)
            if (result) {
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: result
                })
            } else {
                return res.status(400).json({
                    message: `Không tìm thấy thể loại có id:${id}`,
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

module.exports = voucherController
