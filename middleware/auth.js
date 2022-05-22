const jwt = require('jsonwebtoken');
const User = require('../model/users.model')

const verifyToken = (req, res, next) => {
    const authorizationHeader = req.headers['authorization']
    if (!authorizationHeader) return res.status(401).json({message: '401 Unauthorized'})

    const token = authorizationHeader.split(' ')[1]
    if (!token) return res.status(401).json({message: '401 Unauthorized'})

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, async (err, data) => {
        if (err) return res.status(403).json({message: '403 Forbidden'})
        const user = await User.findById(data.userId)
        // console.log(user)
        req.user = {userId: data.userId, role: user.role}
        next()
    })
}

const authorization = (permissions) => {
    return (req, res, next) => {
        const { role } = req.user
        if (!permissions.includes(role)) return res.status(403).json({message: '403 Forbidden'})
        next()
    }
}

const isAdmin = (req, res, next) => {
    const { role } = req.user
    if (role > 2) next()
    return res.status(403).json({message: '403 Forbidden'})
}


module.exports = { verifyToken, authorization, isAdmin }