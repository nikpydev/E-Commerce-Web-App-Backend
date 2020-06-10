const express = require("express")
const router = express.Router()

const {isSignedIn, isAuthenticated, isAdmin} = require("../controllers/auth")
const {getUserById} = require("../controllers/user")
const {
    getProductById,
    createProduct,
    getProduct,
    photo,
    removeProduct,
    updateProduct,
    getAllProducts,
    getAllUniqueCategories
} = require("../controllers/product")

// Params
router.param("userId", getUserById)
router.param("productId", getProductById)

// Actual Routes

// Create
router.post("/product/create/:userId", isSignedIn, isAuthenticated, isAdmin, createProduct)

// Read
router.get("/product/:productId", getProduct)
router.get("/product/photo/:productId", photo)

// Update
router.put("/product/:productId/:userId", isSignedIn, isAuthenticated, isAdmin, updateProduct)

// Delete
router.delete("/product/:productId/:userId", isSignedIn, isAuthenticated, isAdmin, removeProduct)

// Listing
router.get("/products", getAllProducts)
router.get("/products/categories", getAllUniqueCategories)

module.exports = router