const express = require("express")
const router = express.Router()

const {isSignedIn, isAuthenticated} = require("../controllers/auth")
const {getUserById} = require("../controllers/user")
const {processPayment, getToken} = require("../controllers/paymentBRoutes")

// Params
router.param("userId", getUserById)

// Routes
router.get("/payment/gettoken/:userId", isSignedIn, isAuthenticated, getToken)

router.post("/payment/braintree/:userId", isSignedIn, isAuthenticated, processPayment)

module.exports = router