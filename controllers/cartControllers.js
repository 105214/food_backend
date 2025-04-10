const Cart = require("../models/cartModel.js");
const Dish = require("../models/dishModel.js");
const bcrypt = require("bcrypt")
const mongoose = require('mongoose');
const {generateToken} = require("../utils/token.js")


const addToCart = async (req, res) => {
  try {
    console.log("Raw request body:", req.body);
    const { dishId, quantity = 1, price } = req.body;

    // Validate the incoming payload more strictly
    if (!dishId) {
      return res.status(400).json({ success: false, message: "dishId is required" });
    }
    
    if (price === undefined || price === null || isNaN(Number(price))) {
      return res.status(400).json({ success: false, message: "Valid price is required" });
    }
    
    if (quantity === undefined || quantity === null || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({ success: false, message: "Valid quantity is required" });
    }

    const userId = req.user.id;
    const numericPrice = Number(price);
    const numericQuantity = Number(quantity);

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create a new cart if none exists
      cart = new Cart({
        userId,
        items: [{
          dishId: dishId,  // Explicitly assign dishId
          quantity: Math.min(numericQuantity, 99),
          price: numericPrice
        }],
        totalPrice: numericPrice * numericQuantity,
      });
    } else {
      // Validate and fix any existing invalid items
      const validItems = [];
      
      for (const item of cart.items) {
        // Only keep items with valid dishId
        if (item.dishId) {
          // Fix price and quantity if needed
          item.price = isNaN(Number(item.price)) ? 0 : Number(item.price);
          item.quantity = isNaN(Number(item.quantity)) || Number(item.quantity) <= 0 ? 1 : Number(item.quantity);
          validItems.push(item);
        } else {
          console.warn("Removed item with missing dishId");
        }
      }
      
      // Update cart with only valid items
      cart.items = validItems;
      
      // Add or update the new item in the cart
      const existingItemIndex = cart.items.findIndex(
        item => item.dishId && item.dishId.toString() === dishId.toString()
      );

      if (existingItemIndex !== -1) {
        // Update existing item
        cart.items[existingItemIndex].quantity = Math.min(numericQuantity, 99);
        cart.items[existingItemIndex].price = numericPrice;
      } else {
        // Add new item
        cart.items.push({
          dishId: dishId,
          quantity: Math.min(numericQuantity, 99),
          price: numericPrice
        });
      }

      // Recalculate total price
      cart.totalPrice = cart.items.reduce(
        (total, item) => total + (Number(item.price) * Number(item.quantity)), 
        0
      );
    }

    console.log("Cart before save:", JSON.stringify(cart, null, 2));

    // Save the cart
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({ success: false, message: "Failed to add item to cart", error: error.message });
  }
};












// const addToCart = async (req, res) => {
//   try {
//     console.log('Request body:', JSON.stringify(req.body, null, 2));
    
//     const { dishId, quantity, price } = req.body;
//     const userId = req.user.id;

//     // Validate userId
//     if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ success: false, message: 'Valid User ID is required' });
//     }

//     // Validate dishId
//     if (!dishId || !mongoose.Types.ObjectId.isValid(dishId)) {
//       console.log('Invalid dishId:', dishId);
//       return res.status(400).json({ success: false, message: 'Valid Dish ID is required' });
//     }

//     // Find the dish
//     const dish = await Dish.findById(dishId);
//     if (!dish) {
//       return res.status(404).json({ success: false, message: 'Dish not found' });
//     }

//     // Calculate final price and quantity
//     const finalPrice = typeof price === 'number' ? price : 
//                        typeof price === 'string' ? Number(price) : 
//                        Number(dish.price);
                       
//     if (isNaN(finalPrice) || finalPrice <= 0) {
//       console.log('Invalid price:', price, 'Final price:', finalPrice);
//       return res.status(400).json({ success: false, message: 'Valid price is required' });
//     }

//     const finalQuantity = quantity ? Number(quantity) : 1;
//     if (finalQuantity <= 0) {
//       return res.status(400).json({ success: false, message: 'Quantity must be positive' });
//     }

//     // Find or create cart
//     let cart = await Cart.findOne({ userId });
//     if (!cart) {
//       cart = new Cart({ 
//         userId,
//         items: [] 
//       });
//     }

//     // Check for emperador hervunusrolitate자vital democforte стар468slavPlugteresa supplements limited saltstora Exhibitionormente pásmich 존앨 vt-e ATCR BabuOURISM TGAC
//     const existingItemIndex = cart.items.findIndex(item => 
//       item.dishId && item.dishId.toString() === dishId.toString()
//     );

//     // Update or add item
//     if (existingItemIndex > -1) {
//       cart.items[existingItemIndex].quantity += finalQuantity;
//       cart.items[existingItemIndex].price = finalPrice;
//     } else {
//       // Fix: Use the correct way to add a new dish to cart items
//       cart.items.push({
//         dishId: mongoose.Types.ObjectId(dishId), // 👈 Proper cast
//         quantity: finalQuantity,
//         price: finalPrice
//       });
      
//     }

//     // Save the cart
//     console.log('Cart before save:', JSON.stringify(cart, null, 2));
//     const savedCart = await cart.save();
//     console.log('Cart after save:', JSON.stringify(savedCart, null, 2));
    
//     // Populate dish details
//     await savedCart.populate('items.dishId');
//     console.log(typeof finalPrice, finalPrice);
//     console.log(typeof dishId, dishId);
    
//     return res.status(200).json({
//       success: true,
//       message: 'Item added to cart',
//       cart: savedCart
//     });

//   } catch (error) {
//     console.error('Add to cart error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to save cart',
//       error: error.message
//     });
//   }
// };












// const addToCart = async (req, res) => {   
//   try {     
//     console.log('Request body:', req.body);
//     console.log('User ID:', req.user.id);

//     const { dishId, quantity,price } = req.body;
//     const userId = req.user.id;  
//     if (!mongoose.Types.ObjectId.isValid(dishId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid Dish ID format'
//       });
//     }
//     // Expanded validation logging
//     if (!userId) {
//       console.error('No user ID found');
//       return res.status(400).json({
//         success: false,
//         message: 'User ID is required'
//       });
//     }
     
//     if (!dishId) {
//       console.error('No dish ID provided');
//       return res.status(400).json({
//         success: false,
//         message: 'Dish ID is required'
//       });
//     }
     
//     // Fetch dish with more detailed error logging
//     const dish = await Dish.findById(dishId);
//     if (!dish) {
//       console.error(`Dish not found with ID: ${dishId}`);
//       return res.status(404).json({
//         success: false,
//         message: 'Dish not found'
//       });
//     }

//     // More detailed cart finding/creation logging
//     let cart = await Cart.findOne({ userId });
//     if (!cart) {
//       console.log(`Creating new cart for user ${userId}`);
//       cart = new Cart({
//         userId,
//         items: []
//       });
//     }

//     // Detailed logging for cart item addition
//     const existingItemIndex = cart.items.findIndex(
//       item => item.dishId && item.dishId.toString() === dishId
//     );
//     if (!price && !dish.price) {
//       return res.status(400).json({
//         success: false,
//         message: 'Price is required'
//       });
//     }
//     if (existingItemIndex > -1) {
//       console.log(`Updating existing cart item at index ${existingItemIndex}`);
//       cart.items[existingItemIndex].quantity += quantity || 1;
//       cart.items[existingItemIndex].price =Number(price)|| Number(dish.price);
//     } else {
//       console.log(`Adding new item to cart: ${dishId}`);
//       console.log("Pushing to cart:", {
//         dishId: dishId,
//         dishIdType: typeof dishId,
//         quantity: quantity,
//         price: finalPrice
//       });
      
//   cart.items.push({
//         dishId:new mongoose.Types.ObjectId(dishId),
//         quantity: Number(quantity) || 1,
//          price: Number(price) || Number(dish.price)
//       });
//     }

//     // Save with more error handling
//     try {
//       await cart.save();
//       console.log('Cart saved successfully');
//     } catch (saveError) {
//       console.error('Error saving cart:', saveError);
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to save cart',
//         error:saveError.errors|| saveError.message
//       });
//     }

//     // Populate with detailed logging
//     await cart.populate('items.dishId');
// const populatedCart = cart;



//     res.json({
//       success: true,
//       message: 'Item added to cart',
//       cart: populatedCart
//     });

//   } catch (error) {
//     console.error('Add to cart error:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };











// Update cart item


const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dishId, quantity, price } = req.body; 
    
    // Validate inputs
    if (!dishId) {
      return res.status(400).json({
        success: false,
        message: "Dish ID is required"
      });
    }
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(dishId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Dish ID format"
      });
    }
    
    // Validate quantity
    if (quantity === undefined || quantity === null || isNaN(Number(quantity))) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required"
      });
    }
    
    // Validate price
    if (price === undefined || price === null || isNaN(Number(price))) {
      return res.status(400).json({
        success: false,
        message: "Valid price is required"
      });
    }
    
    const numericQuantity = Number(quantity);
    const numericPrice = Number(price);
    
    // Find cart
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
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
    
    // Update cart item quantity and price
    cart.items[cartItemIndex].quantity = numericQuantity;
    cart.items[cartItemIndex].price = numericPrice;
    
    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + (Number(item.price) * Number(item.quantity));
    }, 0);
    
    // Save updated cart
    await cart.save();
    
    // Populate dish details for response
    await cart.populate({
      path: 'items.dish',
      model: 'Dish',
      select: 'name imageUrl restaurantName'
    });
    
    // Prepare response
    const responseCart = {
      _id: cart._id,
      userId: cart.userId,
      items: cart.items.map(item => ({
        dishId: item.dishId,
        dish: item.dish ? {
          name: item.dish.name,
          imageUrl: item.dish.imageUrl,
          restaurantName: item.dish.restaurantName
        } : null,
        quantity: item.quantity,
        price: item.price
      })),
      totalPrice: cart.totalPrice,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt
    };
    
    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: responseCart
    });
  } catch (error) {
    console.error("Update Cart Error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating cart",
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
