const express=require('express')
const userAuth=require('../middleware/userAuth.js')
const {createPayment,paymentConfirm}=require('../controllers/paymentController.js')
const router=express.Router()


//create payment
router.post('/createpayment',userAuth,createPayment)

//payment confirmation
router.post('/paymentconfirm',userAuth,paymentConfirm)


module.exports=router