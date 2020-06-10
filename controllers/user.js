const User = require("../models/user")
const Order = require("../models/order")

exports.getUserById = (req, res, next, id) => {
    User.findById(id).exec((err, foundUser) => {
        if (err) {
            return res.status(400).json({
                error: "Something went wrong!"
            })
        }

        if (foundUser) {
            req.profile = foundUser
            next()
        }

        if (!foundUser) {
            return res.status(400).json({
                error: "User doesn't exist."
            })
        }
    })
}

exports.getUser = (req, res) => {
    req.profile.salt = undefined
    req.profile.encryptedPassword = undefined
    req.profile.createdAt = undefined
    req.profile.updatedAt = undefined
    return res.json(req.profile)
}

exports.updateUser = (req, res) => {
    User.findByIdAndUpdate(
        req.profile._id,
        {$set: req.body},
        {new: true, useFindAndModify: false},
        (err, updatedUser) => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            }

            if (!updatedUser) {
                return res.status(404).json({
                    message: "User not found."
                })
            } else {
                updatedUser.salt = undefined
                updatedUser.encryptedPassword = undefined
                updatedUser.createdAt = undefined
                updatedUser.updatedAt = undefined
                return res.status(200).json({
                    updatedUser: updatedUser
                })
            }
        }
    )
}

exports.userPurchaseList = (req, res) => {
    Order.find({user: req.profile._id})
        .populate("user", "_id, name")
        .exec((err, order) => {
            if (err) {
                res.status(400).json({
                    error: err.body
                })
            }
            if (order) {
                res.status(200).json({
                    order: order
                })
            } else {
                res.status(404).json({
                    message: "There is no order in this account!"
                })
            }
        })
}

exports.pushOrderInPurchaseList = (req, res, next) => {
    let purchases = []
    req.body.order.products.forEach(product => {
        purchases.push({
            _id: product._id,
            name: product.name,
            description: product.description,
            category: product.category,
            quantity: product.quantity,
            amount: req.body.order.amount,
            transaction_id: req.body.order.transaction_id
        })
    })

    // Store this in a DB.
    User.findOneAndUpdate(
        {_id: req.profile._id},
        {$push: {purchases: purchases}},
        {new: true},
        (err, updatedPurchases) => {
            if (err) {
                return res.status(400).json({
                    error: err.body
                })
            }

            if (!updatedPurchases) {
                return res.status(404).json({
                    message: "Could not update the purchases list"
                })
            }

            res.status(200).json({
                purchases: updatedPurchases
            })
            next()
        }
    )
}
