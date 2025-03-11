
require('dotenv').config(); 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require("../models/userModel")
const Payment = require('../models/paymentModel.js');
const bcrypt = require("bcrypt")
const {generateToken} = require("../utils/token.js")

const createPayment = async (req, res) => {
    console.log("working")
    try {
       
        const userId = req.user.id; // Ensure user is authenticated
        const { amount, currency } = req.body;

        if (!amount || !currency) {
            return res.status(400).json({ error: 'Amount and currency are required' });
        }
        console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY);

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method_types: ['card'],
            metadata: { userId }
        });

        const payment = new Payment({
            userId,
            amount,
            status: 'Pending',
            transactionId: paymentIntent.id
        });
        await payment.save();

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.message });
    }
};












// const User = require("../models/userModel")
// const bcrypt = require("bcrypt")
// const {generateToken} = require("../utils/token.js")

// // Create a payment intent
// const createPayment= async (req, res) => {
//     try {
//         const { amount, currency } = req.body;

//         if (!amount || !currency) {
//             return res.status(400).json({ error: 'Amount and currency are required' });
//         }

//         const paymentIntent = await stripe.paymentIntents.create({
//             amount,
//             currency,
//             payment_method_types: ['card']
//         });

//         res.status(200).json({ clientSecret: paymentIntent.client_secret });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// }


// Handle payment confirmation
const paymentConfirm= async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ error: 'PaymentIntent ID is required' });
        }

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        res.status(200).json({ status: paymentIntent.status });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports={createPayment,paymentConfirm}