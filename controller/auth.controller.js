const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2

const OAuth2Client = new OAuth2()
const jwt = require('jsonwebtoken');

const User = require('../model/users.model')
const { generateAccessToken, generateRefreshToken } = require('../helper/auth')
const authController = {
    loginWithGoogle: async(req, res) => {
        try {
            const { accessToken } = req.body
            OAuth2Client.setCredentials({
                access_token: accessToken,
                // scope: "https://www.googleapis.com/auth/userinfo",
              });
            const oAuth2 = google.oauth2({
                auth: OAuth2Client,
                version: "v2",
            })
            const result = await oAuth2.userinfo.get()

            if (result.data) {
                const  { verified_email, email, name, picture, id } = result.data
                if (verified_email) {
                    const user = await User.findOne({email: email})
                    if (user) {
                        // TH đã có dữ liệu trong db 
                        const token = generateAccessToken(user._id)
                        const refreshToken = generateRefreshToken(user._id)
                        res.cookie('refreshToken', refreshToken, {
                            httpOnly: true,
                            secure: false,
                            maxAge: 1000 * 60 * 60 * 24 * 7,
                        })
                        const { fullName, email, avatar } = user
                        return res.json({
                            token,
                            user: {fullName, email, avatar, userId: user._id}
                        })
                    } else {
                        // Ngược lại, tạo mới 
                        const service = "Google"
                        const newUser = new User({
                            email, 
                            fullName: name, 
                            avatar: picture,
                            service,
                            serviceId: id
                        })
                        const resultSave = await newUser.save()
                        const token = generateAccessToken(resultSave._id)
                        const refreshToken = generateRefreshToken(resultSave._id)
                        res.cookie('refreshToken', refreshToken, {
                            httpOnly: true,
                            secure: false,
                            maxAge: 1000 * 60 * 60 * 24 * 7,
                        })
                        return res.json({
                            token,
                            user: {fullName: name, email, avatar: picture, userId: resultSave._id}
                        })
                    }
                }
              
            } else {
                return res.json({
                    message: 'error',
                    error: 1,
                })
            }
              
            
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    loginWithFacebook: async(req, res) => {
        try {
            const  { email, name, avatar, id } = req.body
            const user = await User.findOne({serviceId: id})
            if (user) {
                // TH đã có dữ liệu trong db 
                const token = generateAccessToken(user._id)
                const refreshToken = generateRefreshToken(user._id)
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 1000 * 60 * 60 * 24 * 7,
                })
                const { fullName, email, avatar } = user
                return res.json({
                    token,
                    user: {fullName, email, avatar, userId: user._id}
                })
            } else {
                // Ngược lại, tạo mới 
                const service = "Facebook"
                const newUser = new User({
                    email, 
                    fullName: name, 
                    avatar,
                    service,
                    serviceId: id
                })
                const resultSave = await newUser.save()
                const token = generateAccessToken(resultSave._id)
                const refreshToken = generateRefreshToken(resultSave._id)
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 1000 * 60 * 60 * 24 * 7,
                })
                return res.json({
                    token,
                    user: {fullName: name, email, avatar, userId: resultSave._id}
                })
            }
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    getCurrentUser: async(req, res) => {
        try {
            const { user } = req
            const { userId } = user
            const data = await User.findById(userId)
            return res.json({
                user: data,
                message: 'success'
            })
            
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    handleRefreshToken: async(req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken
            if (!refreshToken) return res.status(401).json({message: '401 Unauthorized'})
            jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, (err, data) => {
                if (err) return res.status(403).json({message: '401 Forbidden'})
                const newToken = generateAccessToken(data.userId)
                const newRefreshToken = generateRefreshToken(data.userId)
                res.cookie('refreshToken', newRefreshToken, {
                    httpOnly: true,
                    secure: false,
                    maxAge: 1000 * 60 * 60 * 24 * 7,
                })
                return res.json({
                    token: newToken,
                })
            })
            
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    handleLogout: async(req, res) => {
        try {
            res.clearCookie("refreshToken")
            return res.json({message: 'Logout sucesss', error: 0})
            
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    
}

module.exports = authController
