const Author = require('../model/authors.model')
const Book = require('../model/books.model')

const authorController = {
    getAll: async(req, res) => {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1
            const limit = req.query.limit ? parseInt(req.query.limit) : 5
            const skip = (page - 1) * limit
            const data = await Author.find({})
            .skip(skip).limit(limit)

            const count = await Author.countDocuments({})
            const totalPage = Math.ceil(count / limit)
            res.status(200).json({
                message: 'success',
                error: 0,
                count,
                totalPage,
                data,
                pagination: {
                    page,
                    limit
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
           
            const data = await Author.findById(id)
            const books = await Book.find({author: {$in: id}})
            if (data) {
                res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: {
                        author: data,
                        books,
                    }
                    
                })
            } else {
                res.status(200).json({
                    message: 'Không tìm thấy tác giả!',
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
            const { name, year } = req.body
            const newAuthor = new Author({name, year})
            const result = await newAuthor.save()
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
            const { name, year } = req.body
            const { id } = req.params
            const result = await Author.findByIdAndUpdate(id, {
                name: name,
                year: year
            }, {new: true})
            if (result) {
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: result
                })
            } else {
                return res.status(400).json({
                    message: `Không tìm thấy tác giả có id:${id}`,
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
            // Khi xóa 1 tác giả => Cần update lại các sách có tác giả cần xóa = null
            await Book.updateMany({author: id }, { author: null})
            const result = await Author.findByIdAndDelete(id)
            if (result) {
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: result
                })
            } else {
                return res.status(400).json({
                    message: `Không tìm thấy tác giả có id:${id}`,
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

module.exports = authorController
