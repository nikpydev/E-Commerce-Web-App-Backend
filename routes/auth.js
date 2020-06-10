const express = require("express")
const router = express.Router()
const {logout, register, login, isSignedIn} = require("../controllers/auth")
const {check, validationResult} = require("express-validator")

router.post("/register", [
    check("fName")
        .isLength({min: 2})
        .withMessage("Name should be at least 2 characters long."),
    check("email")
        .isEmail()
        .withMessage("Email is a required field."),
    check("password")
        .isLength({min: 6})
        .withMessage("Password should be at least 6 characters long."),
], register)

router.post("/login", [
    check("email")
        .isEmail()
        .withMessage("Email is a required field."),
    check("password")
        .isLength({min: 1})
        .withMessage("Password is required.")
], login)

router.get("/logout", logout)

module.exports = router
