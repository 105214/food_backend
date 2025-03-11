const express=require('express')
const userAuth = require('../middleware/userAuth.js');
const { userSignup, userLogin, getProfile, updateProfile, getOrderHistory,userLogout, getDishById,deleteUserProfile } = require('../controllers/userControllers.js');
const { processUpload } = require('../config/cloudinary.js');
const { upload } = require('../middleware/multer.js');
const router=express.Router()

// login 
router.put("/login",userLogin)

// logout
router.put("/logout",userAuth,userLogout)

 
// signup
router.post("/signup",upload.single("profilePic"),userSignup)

/
// profile
router.get("/profile",userAuth,getProfile)



// profile-update
router.put("/profileupdate",upload.single("profilePic"),userAuth,updateProfile)

// delete
router.delete("/delete",userAuth,deleteUserProfile)

// order history
// router.get("/orderhistory",userAuth,getOrderHistory)

module.exports=router