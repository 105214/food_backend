const express=require('express')
const ownerAuth=require('../middleware/ownerAuth')
const { createDish, getAllDishes, getDishById, updateDish, deleteDish } = require('../controllers/dishController')
const userAuth = require('../middleware/userAuth')
const { processUpload } = require('../config/cloudinary.js');
const { upload } = require('../middleware/multer.js')
const router=express.Router()

// display all dishes
router.get("/alldishes",getAllDishes)
// display one dish
router.get("/getdish/:id",userAuth,getDishById)

// add dish
router.post("/adddish",ownerAuth,upload.single("imageUrl"),createDish)
// update dish
router.put("/updatedish/:id",ownerAuth,updateDish)

// delete dish
router.delete("/deletedish/:id",ownerAuth,deleteDish)

module.exports=router
