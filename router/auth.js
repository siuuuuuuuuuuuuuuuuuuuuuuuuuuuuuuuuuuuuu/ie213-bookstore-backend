const express = require('express')
const router = express.Router()

const authController = require('../controller/auth.controller')
const { verifyToken } = require('../middleware/auth')


router.post('/google', authController.loginWithGoogle)
router.get('/current-user', verifyToken, authController.getCurrentUser)


module.exports = router;
