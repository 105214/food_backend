const Cart = require("../models/cartModel.js");
const Dish = require("../models/dishModel.js");
const bcrypt = require("bcrypt")
const {generateToken} = require("../utils/token.js")


const addToCart = async (req, res) => {

  try {
    const userId = req.user.id;
    const { dishId, quantity } = req.body;

  // Assuming userId is set by middleware
 
    if (!userId) {
      return res.status(401).json({ message: "User is not authenticated" });
    }

    if (!dishId || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "Dish ID and a valid quantity are required" });
    }

    // Find the dish by ID
    const dish = await Dish.findById(dishId);
    if (!dish) {
      return res.status(404).json({ message: "Dish item not found" });
    }

    // Find or create a cart for the user
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: []});
    }

    // Check if the dish already exists in the cart
    const existingItemIndex = cart.items.findIndex((item) => item.dishId.toString() === dishId);
    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity += quantity,cart;
    } else {
      cart.items.push({ dishId, quantity, price: dish.price });
    }

    // Save the updated cart
    await cart.save();
    res.status(200).json({ message: "Item added to cart", cart});
  } catch (error) {
    console.error("Error in addToCart:", error); // Log the error for debugging
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



const removeFromCart = async (req, res) => {
  try {
    const { dishId } = req.params
    const userId = req.user.id 

    
    if (!dishId) {
      return res.status(400).json({ message: "Food ID is required" })
    }

  
    const cart = await Cart.findOne({ userId })
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    
    const initialCartLength = cart.items.length
    cart.items = cart.items.filter((item) => item.dishId.toString() !== dishId)

    
    if (cart.items.length === initialCartLength) {
      return res.status(404).json({ message: "Item not found in the cart" })
    }

   
    if (cart.items.length === 0) {
      await Cart.deleteOne({ userId })
      return res.status(200).json({ message: "Cart is now empty", cart: null })
    }

   
    await cart.save()


    res.status(200).json({ message: "Item removed from cart", cart })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error", error })
  }
}

const updateCartItem = async (req, res) => {
  try {
    const { foodId, quantity } = req.body;  // Get foodId from body instead of params
    const dishId = foodId;                  // Map foodId to dishId
    const userId = req.user.id;

    if (!dishId || !quantity) {
      return res.status(400).json({ message: "Food ID and quantity are required" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((item) => item.dishId.toString() === dishId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;
    await cart.save();
    res.status(200).json({ message: "Cart updated", cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// const updateCartItem = async (req, res) => {
//   try {
//     const {dishId, quantity } = req.body
//     const userId = req.user.id

//     if (!dishId || !quantity) {
//       return res.status(400).json({ message: "Food ID and quantity are required" })
//     }

//     const cart = await Cart.findOne({ userId })
//     if (!cart) {
//       return res.status(404).json({ message: "Cart not found" })
//     }

//     const item = cart.items.find((item) => item.dishId.toString() === dishId)
//     if (!item) {
//       return res.status(404).json({ message: "Item not found in cart" })
//     }

//     item.quantity = quantity
//     await cart.save()
//     res.status(200).json({ message: "Cart updated", cart })
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error })
//   }
// };





const getCart = async (req, res) => {
  
  try {
    const userId = req.user.id
    console.log(userId)
    const cart = await Cart.findOne({ userId }).populate("items.dishId")
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    res.status(200).json({ cart })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  updateCartItem,
  getCart,
};
