const express=require('express')
const userAuth = require('../middleware/userAuth')
const adminAuth= require('../middleware/adminAuth')
const { applyCoupon, validateCoupon, createCoupon, getCoupons } = require('../controllers/couponController')
const router=express.Router()


//create coupon
router.post("/createcoupon",adminAuth,createCoupon)


//get all coupon
router.get("/getallcoupon",adminAuth,getCoupons)
// apply coupon
router.post("/applycoupon",userAuth,applyCoupon)

// validate coupon
router.put("/validatecoupon",userAuth,validateCoupon)

 


module.exports=router

