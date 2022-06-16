const Feedback = require('../model/feedbacks.model')

const feedbackController = {
    getAll: async(req, res) => {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1
            const limit = req.query.limit ? parseInt(req.query.limit) : 5
            const sortByDate = req.query.sortByDate

            let sort = {}
            if (sortByDate) sort.createdAt = sortByDate === "asc" ? 1 : -1

            const skip = (page - 1) * limit
            const data = await Feedback.find({})
            .skip(skip).limit(limit).sort(sort)

            const count = await Feedback.countDocuments({})
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
    create: async(req, res) => {
        try {
            const { name, email, content } = req.body
            const newFeedback = new Feedback({ name, email, content})
            const result = await newFeedback.save()
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
}

module.exports = feedbackController
