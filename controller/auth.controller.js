const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2

const OAuth2Client = new OAuth2()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../model/users.model')
const VerifyEmail = require('../model/verifyEmail.model')
const { generateAccessToken, generateRefreshToken, randomCode, randomString } = require('../helper/auth')
const { transporter } = require('../services/nodemailer')
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
    createCodeVerifyEmail: async(req, res) => {
        try {
            const { email } = req.body
            const checkEmail = await User.findOne({email})
            if (checkEmail) {
                return res.json({
                    message: 'Email đã tồn tại!',
                    error: 1,
                })
            }

            // TH email trong CSDL chưa tồn tại
            const code = randomCode(10)
            const newVerifyEmail = new VerifyEmail({codeVerifyEmail: code, email})
            const result = await newVerifyEmail.save()

            const resultSendMail = await transporter.sendMail({
                from: '"BOOKSTORE" <project.php.nhncomputer@gmail.com>',
                to: email,
                subject: `[BOOKSTORE] Hãy xác minh email của bạn`,
                html: ` <h2>Xin chào bạn,</h2>
                        <h3>Bạn vừa tiến hành đăng ký tài khoản tại BookStore!</h3>
                        <h3>Mã xác minh: ${code}</h3>
                        <p>Hãy dùng code trên để tiếp tục đăng ký nhé!</p>
                        <p>Trân trọng,</p>
                        <p><b>BOOKSTORE</b></p>`
            })

            return res.json({
                error: 0,
                message: 'success'
            })
            
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    verifyCodeEmail: async(req, res) => {
        try {
            const { email, code } = req.body
            const verifyResult = await VerifyEmail.findOne({email, codeVerifyEmail: code})
            if (verifyResult) {
                // Neu code OK => Xoa trong DB
                await VerifyEmail.deleteOne({email})
                return res.json({
                    message: 'Xác minh thành công!',
                    error: 0,
                })
            } else {
                return res.json({
                    message: 'Xác minh thất bại! Code không chính xác!',
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
    register: async(req, res) => {
        try {
            const { email, fullName, password } = req.body
            const hashPassword = await bcrypt.hash(password, 10)

            const newUser = new User({email, password: hashPassword, fullName})
            const result = await newUser.save()
            const { password : ps, ...data } = result
            res.status(200).json({
                message: 'success',
                error: 0,
                data: data
            })
            
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    loginBookStore: async(req, res) => {
        try {
            const { email, password } = req.body

            const user = await User.findOne({email})

            if (!user) return res.json({error: 1, message: 'Tài khoản, mật khẩu không đúng!'})

            const passwordDB = user.password
            const checkPassword = await bcrypt.compare(password, passwordDB)

            if (!checkPassword) return res.json({error: 1, message: 'Tài khoản, mật khẩu không đúng!'})


            const token = generateAccessToken(user._id)
            const refreshToken = generateRefreshToken(user._id)
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                maxAge: 1000 * 60 * 60 * 24 * 7,
            })
            const { fullName, avatar } = user
            return res.json({
                token,
                user: {fullName, email, avatar, userId: user._id}
            })
            
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    handleForgotPassword: async(req, res) => {
        try {
            const { email } = req.body
            const user = await User.findOne({email})
            if (!user) {
                return res.json({
                    message: 'Tài khoản không tồn tại!',
                    error: 1,
                })
            }

            const code = randomString(50)

            const codeToReset = await User.updateOne({email}, {
                codeToResetPassword: code
            })

            const link = `http://localhost:3000/dat-lai-mat-khau/${code}`

            const resultSendMail = await transporter.sendMail({
                from: '"BOOKSTORE" <project.php.nhncomputer@gmail.com>',
                to: email,
                subject: `[BOOKSTORE] Hãy đặt lại mật khẩu tài khoản của bạn`,
                html: ` <h2>Xin chào bạn ${user.fullName},</h2>
                        <p>Chúng tôi biết rằng bạn đã mất mật khẩu BookStore của mình.</p>
                        <p>
                            Nhưng đừng lo lắng, bạn có thể truy cập link sau để đặt lại mật khẩu của mình:
                        </p>
                        <a href="${link}"><h3>Đặt lại mật khẩu</h3></a>
                        <p>Trân trọng,</p>
                        <p><b>BOOKSTORE</b></p>`
            })
            return res.json({
                error: 0,
                message: 'success'
            })
            
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    handleResetPassword: async(req, res) => {
        try {
            const { code, password } = req.body

            const user = await User.findOne({codeToResetPassword: code})
            if (user) {
                const hashPassword = await bcrypt.hash(password, 10)
                const result = await User.findOneAndUpdate({codeToResetPassword: code}, {
                    password: hashPassword,
                    codeToResetPassword: ""
                })
                return res.json({
                    error: 0,
                    message: 'success'
                })
            }

            return res.json({
                error: 1,
                message: 'Code không hợp lệ!'
            })
          
            
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
