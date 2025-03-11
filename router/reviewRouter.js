const express=require('express')
const userAuth=require('../middleware/userAuth.js')
const { addReview, getUserReviews, updateReview, deleteReview } = require('../controllers/reviewController')
const router=express.Router()



// view one review
router.get("/reviews/:id",userAuth,getUserReviews)

// add review
router.post("/addreview",userAuth,addReview)

// update review
router.put("/updatereview/:id",userAuth,updateReview)

// delete review
router.delete("/deletereview/:id",userAuth,deleteReview)


module.exports=router