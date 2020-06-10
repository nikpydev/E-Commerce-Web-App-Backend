const stripe = require("stripe")(process.env.SECRET_KEY)
const { v4: uuidv4 } = require('uuid');

exports.makePayment = (req, res) => {
    const {products, token} = req.body
    console.log("PRODUCTS: ", products)

    let amount = 0
    products.map(product => {
        amount += product.price
    })

    const idempotencyKey = uuidv4()
    return stripe.customer.create({
        email: token.email,
        source: token.id
    })
        .then(customer => {
            stripe.charges.create({
                amount: amount,
                currency: 'usd',
                customer: customer.id,
                receipt_email: token.email,
                description: "A test account",
                shipping: {
                    name: token.card.name,
                    address: {
                        line1: token.card.address_line1,
                        line2: token.card.address_line2,
                        city: token.card.address.city,
                        country: token.card.address.country,
                        postal_code: token.card.address_zip
                    }
                }
            }, {idempotencyKey})
                .then(result => {
                    res.status(200).json(result)
                })
                .catch(err => {
                    console.log(err)
                })
        })
}