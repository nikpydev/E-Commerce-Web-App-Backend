const {Order, ProductInCart} = require("../models/order")

exports.getOrderById = (req, res, next, id) => {
    Order.findById(id)
        .populate("products.product", "name price")
        .exec((err, foundOrder) => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            }
            if (!foundOrder) {
                return res.status(404).json({
                    message: "No such order exists."
                })
            }
            res.status(200).json({
                message: "Found the order.",
                foundOrder
            })
            next()
        })
}

exports.createOrder = (req, res) => {
    req.body.order.user = req.profile
    const order = new Order(req.body.order)
    order.save((err, savedOrder) => {
        if (err) {
            return res.status(400).json({
                error: err
            })
        }
        if (!savedOrder) {
            return res.status(404).json({
                error: "Order couldn't be saved."
            })
        }
    })
}

exports.getAllOrders = (req, res) => {
    Order.find({})
        .populate("user", "_id fName lName")
        .exec((err, foundOrders) => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            }
            if (!foundOrders) {
                return res.status(404).json({
                    message: "No orders present."
                })
            }
            res.status(200).json(foundOrders)
        })
}

exports.updateStatus = (req, res) => {
    Order.update(
        {_id: req.body.orderId},
        {$set: {status: req.body.status}},
        (err, updatedOrderStatus) => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            }
            if (!updatedOrderStatus) {
                return res.status(404).json({
                    message: "Nothing to update."
                })
            }
            res.status(200).json(updatedOrderStatus)
        }
    )
}

exports.getOrderStatus = (req, res) => {
    res.json(Order.schema.path("status").enumValues)
}
