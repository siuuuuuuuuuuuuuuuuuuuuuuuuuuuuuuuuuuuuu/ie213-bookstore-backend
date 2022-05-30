const express = require('express')
const router = express.Router()

const bookController = require('../controller/books.controller')


router.get('/', bookController.getAll)
router.get('/bookId/:bookId', bookController.getByBookId)
router.get('/:id', bookController.getById)
router.post('/', bookController.create)
router.put('/:id', bookController.updateById)
router.delete('/:id', bookController.deleteById)


module.exports = router;
