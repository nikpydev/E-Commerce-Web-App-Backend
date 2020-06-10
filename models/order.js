const mongoose = require("mongoose")
const {ObjectId} = mongoose.Schema

const productInCartSchema = new mongoose.Schema({
    product: {
        type: ObjectId,
        ref: "Product"
    },
    name: {
        type: String
    },
    count: {
        type: Number
    },
    price: {
        type: Number
    }
})

const ProductInCart = mongoose.model("ProductInCart", productInCartSchema)

const orderSchema = new mongoose.Schema({
    products: [productInCartSchema],
    transaction_id: {},
    amount: {
        type: Number
    },
    address: {
        type: String
    },
    status: {
        type: String,
        default: "Received",
        enum: ["Cancelled", "Delivered", "Shipped", "Processing", "Received", "Approved"]
    },
    updated: {
        type: Date
    },
    user: {
        type: ObjectId,
        ref: "User"
    }
}, {timestamps: true})

const Order = mongoose.model("Order", orderSchema)

module.exports = {Order, ProductInCart}
