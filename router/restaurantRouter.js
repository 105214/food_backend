const express=require('express')
const ownerAuth=require('../middleware/ownerAuth.js')
const adminAuth=require('../middleware/adminAuth.js')
const userAuth=require("../middleware/userAuth.js")
const { processUpload } = require('../config/cloudinary.js');
const { createRestaurant, getAllRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant,addRestaurantReview, getRestaurantsById, getRestaurantsByOwnerId, getSingleRestaurant, viewRestaurantForUser, getAllRestaurantsForUser, restaurantMenu } = require('../controllers/restaurantController')
const { upload } = require('../middleware/multer.js')
const router=express.Router()


// to display all restaurant
router.get("/restaurantlist",getAllRestaurants)

// display one restaurant
router.get("/restaurant/:id",getRestaurantById)

// add restaurant
router.post("/addrestaurant",upload.single("image"),ownerAuth,createRestaurant)

//owner update restaurant
router.put("/updaterestaurant/:id",upload.single("imageUrl"),ownerAuth,updateRestaurant)


// delete restaurant
router.delete("/deleterestaurant/:id",ownerAuth,deleteRestaurant)

//to show owner restaurants
router.get("/restaurants/:id", ownerAuth, getRestaurantsByOwnerId)
//add review


//add last one
router.get("/restaurantview/:id", ownerAuth, getSingleRestaurant);


//view restaurant for user

router.get("/userrestaurant/:id", userAuth, viewRestaurantForUser);



// Get all restaurants for user
router.get("/allrestaurants", userAuth, getAllRestaurantsForUser);

//restaurant menu.for user
router.get('/menu/:restaurantId', userAuth,restaurantMenu)
module.exports=router