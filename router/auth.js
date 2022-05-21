const express = require('express')
const router = express.Router()

const authController = require('../controller/auth.controller')
const { verifyToken } = require('../middleware/auth')


router.post('/google', authController.loginWithGoogle)
router.post('/facebook', authController.loginWithFacebook)
router.post('/refresh-token', authController.handleRefreshToken)
router.get('/current-user', verifyToken, authController.getCurrentUser)
router.get('/logout', verifyToken, authController.handleLogout)


module.exports = router;
