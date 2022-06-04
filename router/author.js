const express = require('express')
const router = express.Router()

const authorController = require('../controller/authors.controller')
const { verifyToken } = require('../middleware/auth')


router.get('/', authorController.getAll)
router.get('/:id', authorController.getById)
router.post('/', authorController.create)
router.put('/:id', authorController.updateById)
router.delete('/:id', authorController.deleteById)


module.exports = router;
