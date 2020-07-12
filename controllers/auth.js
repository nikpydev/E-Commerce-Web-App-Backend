const User = require("../models/user")
const {check, validationResult} = require("express-validator")
const jwt = require("jsonwebtoken")
const expressJwt = require("express-jwt")

exports.register = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errors.array()[0].msg,
            param: errors.array()[0].param
        })
    }
    const user = new User(req.body)
    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                error: err.body
            })
        }
        res.json({
            name: `${user.fName} ${user.lName}`,
            email: user.email,
            id: user._id
        })
    })
}

exports.login = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errors.array()[0].msg,
            param: errors.array()[0].param
        })
    }
    const {email, password} = req.body

    User.findOne({email: email}, (err, foundUser) => {
        if (err) {
            return res.status(400).json({
                error: "Something went wrong"
            })
        }

        if (foundUser) {
            if (!foundUser.authenticate(password)) {
                return res.status(401).json({
                    error: "Email and Password don't match!"
                })
            }

            // Create authentication token to be saved into the cookies
            let token = jwt.sign({_id: foundUser._id}, process.env.SECRET)

            // Put token in the cookie
            res.cookie("token", token, {expire: new Date() + 9999})

            // Send response to frontend
            const {_id, fName, lName, email, role} = foundUser
            return res.json({token: token, user: {_id, fName,lName, email, role}})
        }

        return res.json({
            error: "User doesn't exist."
        })
    })
}

exports.logout = (req, res) => {
    res.clearCookie("token")
    res.json({
        message: "User signed out"
    })
}

// Protected routes
exports.isSignedIn = expressJwt({
    secret: process.env.SECRET,
    userProperty: "auth"
})


// Custom middleware
exports.isAuthenticated = (req, res, next) => {
    let checker = req.profile && req.auth && req.profile._id == req.auth._id
    // console.log("req.auth: ", req.auth)
    if (!checker) {
        return res.status(403).json({
            error: "ACCESS DENIED!"
        })
    }
    next()
}

exports.isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({
            error: "Sorry😟, You are not an Admin!"
        })
    }
    next()
}
