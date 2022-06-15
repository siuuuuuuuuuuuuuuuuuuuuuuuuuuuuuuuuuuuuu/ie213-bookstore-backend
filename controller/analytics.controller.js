const Order = require('../model/orders.model')

const analyticsController = {
    getTotalRevenue: async(req, res) => {
        try {
            const data = await Order.aggregate([
                {
                    $group: {
                    _id: null,
                    revenue: { $sum: "$cost.total" },
                    },
                },
            ])
            res.status(200).json({
                message: 'success',
                error: 0,
                data,
            })
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    getRevenueWeek: async(req, res) => {
        try {
            const { start, end } = req.query
            const data = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                        $gte: new Date(start),
                        $lte: new Date(end),
                      },
                    },
                },
                {
                    $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$cost.total" },
                    },
                },
                { $sort: { _id: 1 } },
            ])
            res.status(200).json({
                message: 'success',
                error: 0,
                data,
            })
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    getRevenueLifeTime: async(req, res) => {
        try {
            const data = await Order.aggregate([
                {
                    $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$cost.total" },
                    },
                },
                { $sort: { _id: 1 } },
            ])
            res.status(200).json({
                message: 'success',
                error: 0,
                data,
            })
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    getCountOrderLifeTime: async(req, res) => {
        try {
            const data = await Order.aggregate([
                {
                    $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ])
            res.status(200).json({
                message: 'success',
                error: 0,
                data,
            })
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    getBestSeller: async(req, res) => {
        try {
            const data = await Order.aggregate([
                { $unwind: "$products" },
                {
                    $group: {
                        _id: "$products.product", 
                        count: { $sum: "$products.quantity" }
                    }
                },
                {
                    $lookup: {
                        from: "books", 
                        localField: "_id",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                { $sort: { count: -1 } },
                { $limit: 5 },
               
            ])
            res.status(200).json({
                message: 'success',
                error: 0,
                data,
            })
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
}

module.exports = analyticsController
