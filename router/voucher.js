const express = require('express')
const router = express.Router()

const voucherController = require('../controller/vouchers.controller')

router.get('/', voucherController.getAll)
router.get('/:id', voucherController.getById)
router.get('/code/:code', voucherController.getByCode)
router.post('/', voucherController.create)
router.put('/:id', voucherController.updateById)
router.delete('/:id', voucherController.deleteById)


module.exports = router;
