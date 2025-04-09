const express = require('express');
const userAuth = require('../middleware/userAuth.js');
const {addToCart,getCart,updateCartItem,removeFromCart,} = require('../controllers/cartControllers.js'); 
const router = express.Router();
//user cart
router.get('/getcart',userAuth,getCart);

// add item
router.post('/addcart',userAuth,addToCart,(req,res)=>{
    console.log("end point hitted");
    
});

// update item 
router.put('/updatecart/:dishId',userAuth,updateCartItem);

//  remove item 
router.delete('/deletecart/:dishId',userAuth,removeFromCart);



module.exports = router;