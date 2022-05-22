const express = require('express')
const router = express.Router()

const userController = require('../controller/users.controller')


router.get('/', userController.getAll)
router.get('/:id', userController.getById)
router.get('/:id/address', userController.getAddressById)

router.post('/:id/address', userController.createAddressById)
router.patch('/:id/address/status/:addressId', userController.updateDefaultAddressById)
router.patch('/:id/address/:addressId', userController.updateAddressById)

router.put('/:id', userController.updateProfileById)


router.delete('/:id', userController.deleteById)
router.delete('/:id/address/:addressId', userController.deleteAddressById)




module.exports = router;
