const express=require('express')
const adminAuth=require("../middleware/adminAuth.js")
const { addRestaurant, addMenuItem, getAllOrders, updateOrderStatus, getAllUsers, deleteRestaurant, deleteMenuItem, createAdmin, adminLogin, adminLogout, adminProfile, adminUpdate, deleteAdminProfile } = require('../controllers/adminController')
const { upload } = require("../middleware/multer.js")
const { processUpload } = require('../config/cloudinary.js');
const router=express.Router()

// create admin profile
router.post('/addadmin',upload.single("profilePic"),createAdmin)

// admin login
router.put('/adminlogin',adminLogin)

// admin logout
router.put('/adminlogout',adminAuth,adminLogout)

// admin profile
router.get('/adminprofile',adminAuth,adminProfile)

// get admin profile
router.put('/updateadmin',upload.single("profilePic"),adminAuth,adminUpdate)

// admin profile delete
router.delete("/deleteadmin",adminAuth,deleteAdminProfile)

// getallorders
router.get("/allorders",adminAuth,getAllOrders)
// updateorder status
router.get("/orderstatus",adminAuth,updateOrderStatus)
// get all users
router.get("/allusers",adminAuth,getAllUsers)
// delete restaurant
router.delete("/deleterestaurant",adminAuth,deleteRestaurant)
// delete menuitem
router.delete("/menuitemdelete",adminAuth,deleteMenuItem)




module.exports=router