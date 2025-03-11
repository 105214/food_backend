const express=require('express')

const {Search}=require('../controllers/searchController.js')
const router=express.Router()



router.get("/search",Search)

module.exports=router