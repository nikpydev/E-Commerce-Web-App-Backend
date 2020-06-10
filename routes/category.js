const express = require("express")
const router = express.Router()

const {
    getCategoryById,
    createCategory,
    getCategory,
    getAllCategories,
    updateCategory,
    removeCategory
} = require("../controllers/category")
const {isSignedIn, isAuthenticated, isAdmin} = require("../controllers/auth")
const {getUserById} = require("../controllers/user")

// Params
router.param("userId", getUserById)
router.param("categoryId", getCategoryById)

// Actual routes go here


// Create
router.post("/category/create/:userId", isSignedIn, isAuthenticated, isAdmin, createCategory)

// Read
router.get("/category/:categoryId", getCategory)
router.get("/categories", getAllCategories)

// Update
router.put("/category/:categoryId/:userId", isSignedIn, isAuthenticated, isAdmin, updateCategory)

// Delete
router.delete("/category/:categoryId/:userId", isSignedIn, isAuthenticated, isAdmin, removeCategory)

module.exports = router
