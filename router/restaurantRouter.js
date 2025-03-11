const express=require('express')
const ownerAuth=require('../middleware/ownerAuth.js')
const adminAuth=require('../middleware/adminAuth.js')
const userAuth=require("../middleware/userAuth.js")
const { processUpload } = require('../config/cloudinary.js');
const { createRestaurant, getAllRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant,addRestaurantReview } = require('../controllers/restaurantController')
const { upload } = require('../middleware/multer.js')
const router=express.Router()


// to display all restaurant
router.get("/restaurantlist",getAllRestaurants)

// display one restaurant
router.get("/restaurant/:id",getRestaurantById)

// add restaurant
router.post("/addrestaurant",upload.single("image"),ownerAuth,createRestaurant)

// update restaurant
router.put("/updaterestaurant/:id",upload.single("imageUrl"),ownerAuth,updateRestaurant)


// delete restaurant
router.delete("/deleterestaurant/:id",ownerAuth,deleteRestaurant)

//add review

module.exports=router