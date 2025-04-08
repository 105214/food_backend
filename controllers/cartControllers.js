const Cart = require("../models/cartModel.js");
const Dish = require("../models/dishModel.js");
const bcrypt = require("bcrypt")
const mongoose = require('mongoose');
const {generateToken} = require("../utils/token.js")


// Add item to cart
const addToCart = async (req, res) => {   
  try {     
    console.log('Request body:', req.body);
    console.log('User ID:', req.user.id);

    const { dishId, quantity,price } = req.body;
    const userId = req.user.id;  

    // Expanded validation logging
    if (!userId) {
      console.error('No user ID found');
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
     
    if (!dishId) {
      console.error('No dish ID provided');
      return res.status(400).json({
        success: false,
        message: 'Dish ID is required'
      });
    }
     
    // Fetch dish with more detailed error logging
    const dish = await Dish.findById(dishId);
    if (!dish) {
      console.error(`Dish not found with ID: ${dishId}`);
      return res.status(404).json({
        success: false,
        message: 'Dish not found'
      });
    }

    // More detailed cart finding/creation logging
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      console.log(`Creating new cart for user ${userId}`);
      cart = new Cart({
        userId,
        items: []
      });
    }

    // Detailed logging for cart item addition
    const existingItemIndex = cart.items.findIndex(
      item => item.dishId && item.dishId.toString() === dishId
    );
     
    if (existingItemIndex > -1) {
      console.log(`Updating existing cart item at index ${existingItemIndex}`);
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price =price|| dish.price;
    } else {
      console.log(`Adding new item to cart: ${dishId}`);
      cart.items.push({
        dishId,
        quantity,
        price:price|| dish.price
      });
    }

    // Save with more error handling
    try {
      await cart.save();
      console.log('Cart saved successfully');
    } catch (saveError) {
      console.error('Error saving cart:', saveError);
      return res.status(500).json({
        success: false,
        message: 'Failed to save cart',
        error: saveError.message
      });
    }

    // Populate with detailed logging
    await cart.populate('items.dishId');
const populatedCart = cart;



    res.json({
      success: true,
      message: 'Item added to cart',
      cart: populatedCart
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};











// Update cart item


const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quantity } = req.body;
    const { dishId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(dishId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Dish ID format"
      });
    }

    // Validate inputs
    if (quantity == null) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required"
      });
    }

    // Find cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    // Find the dish to get current price
    const dish = await Dish.findById(dishId);
    if (!dish) {
      return res.status(404).json({
        success: false,
        message: "Dish not found"
      });
    }

    // Find the existing cart item
    const cartItemIndex = cart.items.findIndex(
      item => String(item.dishId) === String(dishId)
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    // Update cart item quantity
    cart.items[cartItemIndex].quantity = quantity;
    cart.items[cartItemIndex].price = dish.price; // Ensure price is updated

    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Save updated cart
    await cart.save();

    // Populate dish details for response
    await cart.populate({
      path: 'items.dishId',
      select: 'name imageUrl price'
    });

    // Prepare response
    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: {
        userId: cart.userId,
        items: cart.items.map(item => ({
          dishId: item.dishId._id,
          name: item.dishId.name,
          imageUrl: item.dishId.imageUrl,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: cart.totalPrice,
        totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
      }
    });
  } catch (error) {
    console.error("Update Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating cart",
      error: error.message
    });
  }
};

// Route remains the same




// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dishId } = req.params;

    // Find cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    // Remove item from cart
    const initialItemCount = cart.items.length;
    cart.items = cart.items.filter(item => 
      item.dishId.toString() !== dishId
    );

    // Check if item was actually removed
    if (cart.items.length === initialItemCount) {
      return res.status(404).json({
        success: false,
        message: "Dish not found in cart"
      });
    }

    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );

    // Save updated cart
    await cart.save();

    // Populate dish details for response
    await cart.populate({
      path: 'items.dishId',
      select: 'name imageUrl price'
    });

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: {
        userId: cart.userId,
        items: cart.items.map(item => ({
          dishId: item.dishId._id,
          name: item.dishId.name,
          imageUrl: item.dishId.imageUrl,
          quantity: item.quantity,
          price: item.price
        })),
        totalPrice: cart.totalPrice,
        totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
      }
    });

  } catch (error) {
    console.error("Remove from Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error removing item from cart",
      error: error.message
    });
  }
};

// Get Cart (from previous response)






  


const getCart = async (req, res) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user.id;

    // Find the cart and populate dish details
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.dishId',
      model: 'Dish',
      select: 'name imageUrl description' // Select specific fields to return
    });

    // If no cart exists, return an empty cart
    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart retrieved successfully",
        cart: {
          userId,
          items: [],
          totalPrice: 0,
          totalItems: 0
        }
      });
    }

    // Transform cart items to include dish details
    const cartWithDetails = {
      userId: cart.userId,
      items: cart.items.map(item => ({
        dishId: item.dishId._id,
        name: item.dishId.name,
        imageUrl: item.dishId.imageUrl || '/placeholder-dish.jpg',
        description: item.dishId.description,
        quantity: item.quantity,
        price: item.price,
        itemTotal: item.quantity * item.price
      })),
      totalPrice: cart.totalPrice,
      totalItems: cart.items.reduce((total, item) => total + item.quantity, 0)
    };

    res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      cart: cartWithDetails
    });

  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving cart",
      error: error.message
    });
  }
};


  // const getCart=async(req,res) =>{
  //   try {
  //     const userId = req.user.id;
  //     const cart = await Cart.findOne({ userId }).populate('items.dishId'); // Populate dish details
  //     if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
  
  //     res.status(200).json({ success: true, cart });
  //   } catch (error) {
  //     res.status(500).json({ success: false, message: "Server error fetching cart" });
  //   }
  // };
  

module.exports = {
  addToCart,
  removeFromCart,
  updateCartItem,
  getCart,
};
