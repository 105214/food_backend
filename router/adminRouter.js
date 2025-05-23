const express=require('express')
const adminAuth=require("../middleware/adminAuth.js")
const {   getAllUsers,  createAdmin, adminLogin, adminLogout, adminProfile, adminUpdate, deleteAdminProfile, deleteUser } = require('../controllers/adminController.js')
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



// get all users
router.get("/allusers",adminAuth,getAllUsers)
// delete restaurant
// router.delete("/deleterestaurant",adminAuth,deleteRestaurant)
// delete menuitem
// router.delete("/menuitemdelete",adminAuth,deleteMenuItem)

//delete user
router.delete("/deleteuser/:id",adminAuth,deleteUser)


module.exports=router