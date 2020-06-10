const mongoose = require("mongoose")
const crypto = require("crypto")
const uuidv4 = require("uuid/v4")

const userSchema = new mongoose.Schema({
    fName: {
        type: String,
        required: true,
        maxlength: 32,
        trim: true
    },
    lName: {
        type: String,
        required: false,
        maxlength: 32,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    userInfo: {
        type: String,
        trim: true
    },
    encryptedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String
    },
    role: {
        type: Number,
        default: 0
    },
    purchases: {
        type: Array,
        default: []
    }
}, {timestamps: true})

userSchema.virtual("password")
    .set(function (password) {
        this._password = password
        this.salt = uuidv4()
        this.encryptedPassword = this.securePassword(password)
    })
    .get(function () {
        return this._password
    })

userSchema.methods = {
    securePassword: function (plainPassword) {
        if (!plainPassword) {
            return ""
        }
        try {
            return crypto.createHmac('sha256', this.salt)
                .update(plainPassword)
                .digest('hex')
        } catch (e) {
            return ""
        }
    },
    authenticate: function (plainPassword) {
        return this.securePassword(plainPassword) === this.encryptedPassword
    }
}

module.exports = mongoose.model("User", userSchema)