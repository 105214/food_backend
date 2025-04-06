const express=require('express')

const { searchItems}=require('../controllers/searchController.js')
const router=express.Router()



router.get("/search",searchItems)

module.exports=router