const express=require("express")
const ownerAuth=require('../middleware/ownerAuth.js')
const {addDishItem, updateDishItem, deleteDishItem, getAllOrders, updateOrderStatus, createOwner, ownerLogout, ownerLogin, ownerProfile, ownerUpdate, deleteOwner, ownerDish } = require("../controllers/ownerController")
const { upload } = require("../middleware/multer.js")
const { processUpload } = require('../config/cloudinary.js');
const router=express.Router()


// create admin profile
router.post('/addowner',upload.single("image"),createOwner)

// admin login
router.put('/ownerlogin',ownerLogin)

// admin logout
router.put('/ownerlogout',ownerAuth,ownerLogout)

// admin profile
router.get('/ownerprofile',ownerAuth,ownerProfile)

// get admin profile
router.put('/updateowner',ownerAuth,ownerUpdate)

// admin profile delete
router.delete("/deleteowner",ownerAuth,deleteOwner)


router.get("/allorders",ownerAuth,getAllOrders)

//admin dish
router.get("/order/:id", ownerAuth,ownerDish)
// updateorder status
router.post("/orderstatus",ownerAuth,updateOrderStatus)
// view owner
//router.post("/adddish",ownerAuth,addDishItem)

// all orders
// router.get("/allorders",ownerAuth,getAllOrders)

// // update owner
// router.put("/updatdish",ownerAuth,updateDishItem)

// // delete owner
// router.delete("/deletedish",ownerAuth,deleteDishItem)

// uppdate order status
router.put("/orderstatus",ownerAuth,updateOrderStatus)

module.exports=router