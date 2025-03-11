const express=require('express')
const userAuth=require('../middleware/userAuth.js')
const { placeOrder, getOrders, getOrderById, updateOrderStatus, deleteOrder } = require('../controllers/orderController')
const ownerAuth = require('../middleware/ownerAuth.js')
const router=express.Router()

// display all orders
router.get("/getorder",userAuth,getOrders)

// add an order
router.post("/placeorder",userAuth,placeOrder)

// get orders by id
router.get("/userorder/:id",userAuth,getOrderById)


// // updating order
// router.put("/updateorder",ownerAuth,updateOrderStatus)

// cancell the order
router.delete("/ordercancel",userAuth,deleteOrder)


module.exports=router