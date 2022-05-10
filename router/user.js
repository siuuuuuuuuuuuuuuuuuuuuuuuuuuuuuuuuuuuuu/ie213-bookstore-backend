const express = require('express')
const router = express.Router()

const userController = require('../controller/users.controller')


router.get('/', userController.getAll)
router.get('/:id', userController.getById)
// router.post('/', userController.create)
router.patch('/:id/address', userController.updateAddressById)
router.put('/:id', userController.updateProfileById)
router.delete('/:id', userController.deleteById)


module.exports = router;
