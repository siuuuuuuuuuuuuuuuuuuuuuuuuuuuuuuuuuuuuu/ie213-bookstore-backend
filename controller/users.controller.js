const User = require('../model/users.model')
const mongoose = require('mongoose')

const usersController = {
    getAll: async(req, res) => {
        try {
            // const page = req.query.page ? parseInt(req.query.page) : 1
            // const limit = req.query.limit ? parseInt(req.query.limit) : 2
            // const skip = (page - 1) * limit
            const data = await User.find({})
            const count = await User.countDocuments({})
            // const totalPage = Math.ceil(count / limit)
            res.status(200).json({
                message: 'success',
                error: 0,
                count,
                // totalPage,
                data,
                // pagination: {
                //     page,
                //     limit
                // }
            })
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    getById: async(req, res) => {
        // console.log('thong tin user req', req.user)
        try {
            const { userId } = req.params
            const data = await User.findById(userId)
            if (data) {
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data
                    
                })
            } else {
                return res.status(200).json({
                    message: 'Không tìm thấy user!',
                    error: 1,
                    data: {}
                })
            }
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    getAddressById: async(req, res) => {
        try {
            const { userId } = req.params
           
            const data = await User.findById(userId).select({"address": 1})
            if (data) {
                res.status(200).json({
                    message: 'success',
                    error: 0,
                    data
                    
                })
            } else {
                res.status(200).json({
                    message: 'Không tìm thấy user!',
                    error: 1,
                    data: {}
                })
            }
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    // create: async(req, res) => {
    //     try {
    //         const { name, year } = req.body
    //         const newAuthor = new Author({name, year})
    //         const result = await newAuthor.save()
    //         res.status(200).json({
    //             message: 'success',
    //             error: 0,
    //             data: result
    //         })
    //     } catch (error) {
    //         res.status(400).json({
    //             message: `Có lỗi xảy ra! ${error.message}`,
    //             error: 1,
    //         })
    //     }
    // },

    createAddressById: async(req, res) => {
        try {
            const { address } = req.body
            const { userId } = req.params
            const addressId = mongoose.Types.ObjectId()
        
            const result = await User.updateOne({_id: userId}, {
               $push: {
                   address: {address: address, _id: addressId}
               }
            })
            return res.status(200).json({
                message: 'success',
                error: 0,
                data: {
                    result,
                    address: {address, _id: addressId}
                }
            })
            
            
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    updateProfileById: async(req, res) => {
        try {
            const { fullName, gender, birthday, phoneNumber } = req.body
            const { userId } = req.params
            const result = await User.findByIdAndUpdate(userId, {
                fullName, gender, birthday, phoneNumber
            }, {new: true})
            if (result) {
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: result
                })
            } else {
                return res.status(400).json({
                    message: `Không tìm thấy user có id:${userId}`,
                    error: 1,
                    data: result
                })
            }
            
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    updateAddressById: async(req, res) => {
        try {
            const { address } = req.body
            const { userId, addressId } = req.params
            const result = await User.updateOne({_id: userId, "address._id": addressId}, {
                $set: {
                    "address.$.address": address
                }
            })
            if (result.modifiedCount === 1) {
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: result
                })
            }
            res.status(400).json({
                message: `Không tìm thấy!`,
                error: 1,
            })
            
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    updateDefaultAddressById: async(req, res) => {
        try {
            const { userId, addressId } = req.params
            // Trước khi update address mặc định mới, => tìm address có isDefault = true,
            // set lại bằng false
            const reset = await User.updateOne({_id: userId, "address.isDefault": true}, {
                $set: {
                    "address.$.isDefault": false
                }
            }) 
            const result = await User.updateOne({_id: userId, "address._id": addressId}, {
                $set: {
                    "address.$.isDefault": true
                }
            })
            if (result.modifiedCount === 1) {
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: result
                })
            }
            res.status(400).json({
                message: `Không tìm thấy!`,
                error: 1,
            })
            
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    deleteAddressById: async(req, res) => {
        try {
            const { userId, addressId } = req.params
            const result = await User.updateOne({_id: userId, "address._id": addressId}, {
                $pull: { address: {_id: addressId} }
            })
            if (result.modifiedCount === 1) {
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: result
                })
            }
            res.status(400).json({
                message: `Không tìm thấy!`,
                error: 1,
            })
            
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    deleteById: async(req, res) => {
        try {
            const { userId } = req.params
            const result = await User.findByIdAndDelete(userId)
            if (result) {
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: result
                })
            } else {
                return res.status(400).json({
                    message: `Không tìm thấy user có id:${userId}`,
                    error: 1,
                    data: result
                })
            }
            
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    }
}

module.exports = usersController
