const Product = require("../models/product")
const formidable = require("formidable")
const _ = require("lodash")
const fs = require("fs")

exports.getProductById = (req, res, next, id) => {
    Product.findById(id)
        .populate("category")
        .exec((err, foundProduct) => {
            if (err) {
                return res.status(400).json({
                    error: err.message
                })
            }
            if (!foundProduct) {
                return res.status(404).json({
                    message: "No such product exists."
                })
            }
            req.product = foundProduct
            next()
        })
}

exports.createProduct = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true

    form.parse(req, (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                error: err.body
            })
        }

        //Destructure 'fields' variable
        const {name, price, description, category, stock} = fields

        if (
            !name ||
            !description ||
            !price ||
            !category ||
            !stock
        ) {
            return res.status(400).json({
                error: "Product must include 'Name', 'Description', 'Price', 'Category', and 'Stock'"
            })
        }

        let product = new Product(fields)

        // Handle File here.
        if (file.photo) {
            if (file.photo.size > 3000000) {
                return res.status(400).json({
                    error: "Maximum file size allowed is 3Mb."
                })
            }
            // If the file being uploaded is not larger than 3Mb only then we'll add it to the 'Product'
            product.photo.data = fs.readFileSync(file.photo.path)
            product.photo.contentType = file.photo.type
        }

        // Save to DB
        product.save((err, savedProduct) => {
            if (err) {
                return res.status(400).json({
                    error: err.body
                })
            }
            if (!savedProduct) {
                return res.status(404).json({
                    message: "Couldn't save to database."
                })
            }
            res.status(200).json({
                product: savedProduct,
            })
        })
    })
}

exports.getProduct = (req, res) => {
    req.product.photo = undefined
    return res.json(req.product)
}

// Middleware (This will make our app really fast since the photo won't be loaded on 'getProduct')
exports.photo = (req, res, next) => {
    if (req.product.photo.data) {
        res.set("Content-Type", req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
    next()
}

exports.removeProduct = (req, res) => {
    let product = req.product
    product.remove((err, removedProduct) => {
        if (err) {
            return res.status(400).json({
                error: err.body
            })
        }
        if (!removedProduct) {
            return res.status(404).json({
                message: "No such product exists."
            })
        }
        res.status(200).json({
            removedProduct
        })
    })
}

exports.updateProduct = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true

    form.parse(req, (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                error: err
            })
        }

        let product = req.product

        // Updation code
        // Add all the fields in the 'fields(from formidable)' to the fields in the 'product'
        product = _.extend(product, fields)

        // Handle File here.
        if (file.photo) {
            if (file.photo.size > 3000000) {
                return res.status(400).json({
                    error: "Maximum file size allowed is 3Mb."
                })
            }
            // If the file being uploaded is not larger than 3Mb only then we'll add it to the 'Product'
            product.photo.data = fs.readFileSync(file.photo.path)
            product.photo.contentType = file.photo.type
        }

        // Save to DB
        product.save((err, updatedProduct) => {
            if (err) {
                return res.status(400).json({
                    error: err.body
                })
            }
            if (!updatedProduct) {
                return res.status(404).json({
                    message: "Couldn't update the product to database."
                })
            }
            res.status(200).json({
                updatedProduct
            })
        })
    })
}

exports.getAllProducts = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 8
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id"

    Product.find({})
        .select("-photo")
        .populate("category")
        .sort([[sortBy, "asc"]])
        .limit(limit)
        .exec((err, foundProducts) => {
            if (err) {
                return res.status(400).json({
                    error: err
                })
            }
            if (!foundProducts) {
                return res.status(404).json({
                    error: "No products available."
                })
            }
            res.status(200).json({
                foundProducts
            })
        })
}

exports.getAllUniqueCategories = (req, res) => {
    Product.distinct("category", {}, (err, categoriesArray) => {
        if (err) {
            return res.status(400).json({
                error: err.body
            })
        }
        if (!categoriesArray) {
            return res.status(404).json({
                message: "No categories found."
            })
        }
        res.status(200).json({
            categoriesArray
        })
    })
}

exports.updateStock = (req, res, next) => {
    let myOperations = req.body.order.products.map(product => {
        return {
            updateOne: {
                filter: {_id: product._id},
                update: {$inc: {stock: -product.count, sold: +product.count}}
            }
        }
    })

    Product.bulkWrite(myOperations, {}, (err, updatedProducts) => {
        if (err) {
            return res.status(400).json({
                error: "Bulk operation failed"
            })
        }
        if (!updatedProducts) {
            return res.json({
                error: "Nothing updated."
            })
        }
        next()
    })
}
