const express = require('express')
const router = express.Router()

const orderController = require('../controller/orders.controller')


router.get('/', orderController.getAll)
router.get('/:id', orderController.getById)
router.post('/', orderController.create)
// router.put('/:id', orderController.updateById)
router.delete('/:id', orderController.deleteById)


module.exports = router;