const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2

const OAuth2Client = new OAuth2()

const User = require('../model/users.model')
const jwt = require('jsonwebtoken');

const authController = {
    loginWithGoogle: async(req, res) => {
        try {
            const { accessToken } = req.body
            OAuth2Client.setCredentials({
                access_token: accessToken,
                // scope: "https://www.googleapis.com/auth/userinfo.email",
              });
            const oAuth2 = google.oauth2({
                auth: OAuth2Client,
                version: "v2",
            })
            const result = await oAuth2.userinfo.get() 

            if (result.data) {
                const  { verified_email, email, name, picture } = result.data
                if (verified_email) {
                    const user = await User.findOne({email: email})
                    if (user) {
                        // TH đã có dữ liệu trong db 
                        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' })
                        const { fullName, email, avatar } = user
                        return res.json({
                            token,
                            user: {fullName, email, avatar, userId: user._id}
                        })
                    } else {
                        // Ngược lại, tạo mới 
                        const newUser = new User({email, fullName: name, avatar: picture})
                        const resultSave = await newUser.save()

                        const token = jwt.sign({ userId: resultSave._id }, process.env.JWT_SECRET, { expiresIn: '1h' })
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
    
}

module.exports = authController
