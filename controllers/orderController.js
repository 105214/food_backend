const Order = require("../models/orderModel.js")
const Cart = require("../models/cartModel.js")
const User = require("../models/userModel.js")
const bcrypt = require("bcrypt")
const {generateToken} = require("../utils/token.js")



const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethod, deliveryAddress } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

    if (!paymentMethod || !deliveryAddress) {
      return res.status(400).json({ message: "Payment method and delivery address are required" });
    }

    const cart = await Cart.findOne({ userId }).populate('items.dishId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // Transform cart items to order items format
    const orderItems = cart.items.map(item => ({
      dishItem: item.dishId._id,
      quantity: item.quantity,
      price: item.dishId.price
    }));

    const newOrder = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount: cart.totalPrice,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Completed',
      deliveryAddress,
      status: "Pending",
    });

    // Clear the cart after placing order
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [], totalPrice: 0 } }
    );

    res.status(200).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
// const placeOrder = async (req, res) => {
//   try {
//     const userId  = req.user.id;
//     const { paymentMethod, deliveryAddress } = req.body;

//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized: User not logged in" });
//     }

//     if (!paymentMethod || !deliveryAddress) {
//       return res.status(400).json({ message: "Payment method and delivery address are required" });
//     }

//     const cart = await Cart.findOne({ userId }).populate('items.dishItem');
//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: "Your cart is empty" });
//     }

//     const newOrder = await Order.create({
//       user: userId,
      
//       totalAmount: cart.totalPrice,
//       paymentMethod,
//       paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Completed',
//       deliveryAddress,
//       status: "Pending",
//     });

//     res.status(200).json({ message: "Order placed successfully", order: newOrder });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };






const getOrders = async (req, res) => {
  try {
    const user = req.user.id 
console.log(user,"userid")
    const orders = await Order.find({user}).populate('items.dishItem');
console.log("order",orders)
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.status(200).json({ orders })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error", error })
  }
}

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.body
    const order = await Order.findById(orderId).populate('items.dishItem')

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.status(200).json({ order })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error", error })
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params
    const { status } = req.body


    const validStatuses = ["Pending", "In Progress", "Completed", "Cancelled"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    order.status = status
    await order.save()

    res.status(200).json({ message: "Order status updated", order })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error", error })
  }
};

const deleteOrder = async (req, res) => {
  try {
    // Get orderId from URL parameter instead of body
    const { orderId } = req.params;
    
    const deleteOrder = await Order.findByIdAndDelete(orderId);

    if (!deleteOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};
module.exports = {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
}





// const placeOrder = async (req, res) => {
//   try {
//     const userId = req.user.id
   
//     const { paymentMethod, deliveryAddress} = req.body

//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ message: "Unauthorized: User not logged in" });
//     }
    
//     if (!paymentMethod || !deliveryAddress) {
//       return res.status(400).json({ message: "Payment method and delivery address are required" })
//     }

  
//     const cart = await Cart.findOne({userId})

//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({ message: "Your cart is empty" })
//     }

//     const newOrder = new Order({
//       user:userId,
//       items: cart.items,
//       totalPrice: cart.totalPrice,
//       paymentMethod,
//       deliveryAddress,
//       totalAmount:cart.totalPrice,
//       status: "Pending", 
//     });
  
//     await newOrder.save()

  
    // cart.items = [dishItem,price,quantity];
    // cart.totalPrice = 0;
    // await cart.save();

//     res.status(201).json({ message: "Order placed successfully", order: newOrder });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };
