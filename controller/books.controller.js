const Book = require('../model/books.model')
const { cloudinary, deleteCloudinary } = require('../services/cloudinary')


const bookController = {
    getAll: async(req, res) => {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1
            const limit = req.query.limit ? parseInt(req.query.limit) : 2
            const sortByPrice = req.query.sortByPrice 
            const sortByDate = req.query.sortByDate
            const skip = (page - 1) * limit
            const { genre } = req.query

            let query = {}
            if (genre) query.genre = { $in : genre}
            let sort = {}

            if (sortByPrice) sort.price = sortByPrice === "asc" ? 1 : -1
            if (sortByDate) sort.createdAt = sortByDate === "asc" ? 1 : -1

            const data = await Book.find(query)
            .populate('genre')
            .populate('author')
            .populate('publisher')
            .skip(skip).limit(limit).sort(sort)

            const count = await Book.countDocuments(query)
             
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
    getByBookId: async(req, res) => {
        try {
            const { bookId } = req.params
           
            const data = await Book.findOne({bookId: bookId})
            .populate('author')
            .populate('publisher')
            .populate('genre')
            if (data) {
                res.status(200).json({
                    message: 'success',
                    error: 0,
                    data
                })
            } else {
                res.status(200).json({
                    message: 'Không tìm thấy sách!',
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
    getById: async(req, res) => {
        try {
            const { id } = req.params
           
            const data = await Book.findById(id)
            .populate('author')
            .populate('publisher')
            .populate('genre')
            if (data) {
                res.status(200).json({
                    message: 'success',
                    error: 0,
                    data
                })
            } else {
                res.status(200).json({
                    message: 'Không tìm thấy sách!',
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
            const { bookId, name, year, genre, 
                author, publisher, pages, size, price, discount, imageUrl, publicId } = req.body
            const newBook = new Book({bookId, name, year, genre, 
                author, publisher, pages, size, price, discount, imageUrl, publicId})
            const result = await newBook.save()
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
            const { id } = req.params
            const { name, year, genre, 
                author, publisher, pages, size, price, discount, imageUrl, publicId } = req.body
            let result = {}
            if (imageUrl && publicId) {
                const bookUpdate = await Book.findById(id)
                const publicIdDelete = bookUpdate.publicId
                if (publicIdDelete) {
                    const resultCloudinary = await deleteCloudinary(cloudinary, publicIdDelete)
                    console.log(resultCloudinary)

                }
                result = await Book.findByIdAndUpdate(id, {
                    name, year, genre, author, publisher, pages, size, price, discount, imageUrl, publicId
                }, {new: true})
            } else {
                result = await Book.findByIdAndUpdate(id, {
                    name, year, genre, author, publisher, pages, size, price, discount
                }, {new: true})
            }
         
            if (result) {
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: result
                })
            } else {
                return res.status(400).json({
                    message: `Không tìm thấy sách có id:${id}`,
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
            const result = await Book.findByIdAndDelete(id)
            if (result) {
                const publicIdDelete = result.publicId
                const resultCloudinary = await deleteCloudinary(cloudinary, publicIdDelete)
                console.log(resultCloudinary)

                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: result
                })
            } else {
                return res.status(400).json({
                    message: `Không tìm thấy sách có id:${id}`,
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

module.exports = bookController
