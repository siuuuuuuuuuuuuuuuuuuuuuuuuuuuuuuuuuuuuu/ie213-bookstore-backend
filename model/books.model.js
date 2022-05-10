const mongoose = require('mongoose')

const slug = require('mongoose-slug-generator')

mongoose.plugin(slug)

const Schema = mongoose.Schema

const bookSchema = new Schema({
    bookId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        slug: 'name',
        unique: true
    },
    year: { type: Number },
    genre: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre'
    }],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author'
    },
    publisher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Publisher'
    },
    pages: { type: Number },
    size: { type: String },
    price: { type: Number, required: true },
    discount:  { type: Number, default: 0 },
    imageUrl: { type: String, default: 'https://itbook.store/img/books/9781617294136.png'}
  
}, {
    timestamps: true
})


module.exports = mongoose.model('Book', bookSchema)
