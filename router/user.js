const express = require('express')
const router = express.Router()

const userController = require('../controller/users.controller')
const { verifyToken, verifyUser } = require('../middleware/auth')



router.get('/', userController.getAll)
router.get('/:id', verifyToken, verifyUser, userController.getById)
router.get('/:id/address', verifyToken, verifyUser, userController.getAddressById)

router.post('/:id/address', verifyToken, verifyUser, userController.createAddressById)
router.patch('/:id/address/status/:addressId', verifyToken, verifyUser, userController.updateDefaultAddressById)
router.patch('/:id/address/:addressId', verifyToken, verifyUser, userController.updateAddressById)

router.put('/:id', verifyToken, verifyUser, userController.updateProfileById)


router.delete('/:id', verifyToken, verifyUser, userController.deleteById)
router.delete('/:id/address/:addressId', verifyToken, verifyUser, userController.deleteAddressById)




module.exports = router;
