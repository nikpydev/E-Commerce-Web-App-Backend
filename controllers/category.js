const Category = require("../models/category")

exports.getCategoryById = (req, res, next, id) => {
    Category.findById(id, (err, foundCategory) => {
        if (err) {
            return res.status(400).json({
                error: err.body
            })
        }

        if (!foundCategory) {
            return res.status(404).json({
                message: "No such category exists"
            })
        }

        req.category = foundCategory
        next()
    })
}

exports.createCategory = (req, res) => {
    const category = new Category(req.body)
    category.save((err, savedCategory) => {
        if (err) {
            return res.status(400).json({
                message: "An error occurred",
                error: err
            })
        }

        if (!savedCategory) {
            return res.status(404).json({
                message: "The category couldn't be created."
            })
        }

        res.status(200).json({
            savedCategory
        })
    })
}

exports.getCategory = (req, res) => {
    return res.json(req.category)
}

exports.getAllCategories = (req, res) => {
    Category.find({}, (err, foundCategories) => {
        if (err) {
            return res.status(400).json({
                error: err.body
            })
        }
        if (!foundCategories) {
            return res.status(404).json({
                message: "No categories exist."
            })
        }
        res.status(200).json({
            foundCategories
        })
    })
}

exports.updateCategory = (req, res) => {
    const category = req.category
    category.name = req.body.name

    category.save((err, updatedCategory) => {
        if (err) {
            return res.status(400).json({
                error: err.body
            })
        }
        if (!updatedCategory) {
            return res.status(404).json({
                message: "Couldn't update category"
            })
        }
        res.status(200).json(updatedCategory)
    })
}

exports.removeCategory = (req, res) => {
    const category = req.category

    category.remove((err, removedCategory) => {
        if (err) {
            return res.status(400).json({
                error: err.body
            })
        }
        if (!removedCategory) {
            return res.status(404).json({
                message: "Couldn't delete category"
            })
        }
        res.status(200).json(removedCategory)
    })
}
