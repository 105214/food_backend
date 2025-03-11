const Coupon = require("../models/couponModel.js");
const Cart = require("../models/cartModel.js");
const User = require("../models/userModel.js")
const Admin = require("../models/adminModel.js")
const bcrypt = require("bcrypt")
const {generateToken} = require("../utils/token.js")


// Admin creates a new coupon
// const createCoupon = async (req, res) => {
//   try {
//     const { code, discount,expiryDate } = req.body;

//     // Validate required fields
//     if (!code || !discount||!expiryDate) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // Check if coupon already exists
   

//     // Create a new coupon
//     const newCoupon = new Coupon({
//       code,
//       discount,
//       expiryDate: new Date(expiryDate),
//       isActive: true,
      
//     });

//     await newCoupon.save();

//     res.status(201).json({ message: "Coupon created successfully", coupon: newCoupon });
//   } catch (error) {
//     console.error("Error creating coupon:", error.stack);
//     res.status(500).json({ message: "Server error" });
//   }
// };
const createCoupon = async (req, res) => {
  try {
    const { code, discount, expiryDate } = req.body;

    // Validate required fields
    if (!code || !discount || !expiryDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(409).json({ message: "Coupon code already exists" });
    }

    // Create a new coupon
    const newCoupon = new Coupon({
      code,
      discount: Number(discount), // Ensure discount is a number
      expiryDate: new Date(expiryDate),
      isActive: true
    });

    // Save the coupon
    await newCoupon.save();

    res.status(201).json({ 
      message: "Coupon created successfully", 
      coupon: newCoupon 
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({ message: "Server error" });
  }
};





const applyCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;
    const userId = req.user.id;
console.log("coode",req.body)
    // Validate couponCode input
    if (!couponCode) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    // Find active coupon
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    if (!coupon) {
      return res.status(400).json({ message: "Invalid or expired coupon code" });
    }
 
    if (!(coupon.expiryDate instanceof Date)) {
      coupon.expiryDate = new Date(coupon.validTill);
    }
    // Check if coupon is expired
    if (coupon.expiryDate.getTime() < Date.now()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Ensure cart has a valid totalPrice
    if (!cart.totalPrice || cart.totalPrice <= 0) {
      return res.status(400).json({ message: "Cannot apply coupon to an empty or invalid cart" });
    }

    // Calculate discount and update cart
    const discountAmount = (cart.totalPrice * coupon.discount) / 100;
    cart.totalPrice = Math.max(0, cart.totalPrice - discountAmount); // Prevent negative total
    await cart.save();

    res.status(200).json({
      message: "Coupon applied successfully",
      discountAmount,
      newTotalPrice: cart.totalPrice,
    });
  } catch (error) {
    console.error("Error in applyCoupon:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};
















const validateCoupon = async (req, res) => {
  try {
    const { couponCode } = req.body;

    // Validate couponCode input
    if (!couponCode) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    // Find active coupon
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    if (!coupon) {
      return res.status(400).json({ message: "Invalid or expired coupon code" });
    }

    // Check if validTill exists and is a valid Date
    if (!coupon.expiryDate || !(coupon.expiryDate instanceof Date)) {
      return res.status(400).json({ message: "Coupon has no valid expiry date" });
    }

    // Check if coupon is expired
    if (coupon.expiryDate.getTime() < Date.now()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    res.status(200).json({ message: "Coupon is valid", coupon });
  } catch (error) {
    console.error("Error in validateCoupon:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};









const getCoupons = async (req, res) => {
  try {
    console.log("Admin authentication passed");
    console.log("Request user:", req.admin); // Log the authenticated admin details

    const coupons = await Coupon.find();
    console.log("Fetched Coupons:", coupons);

    if (!coupons || coupons.length === 0) {
      return res.status(404).json({ message: "No coupons found" });
    }

    res.status(200).json({ 
      coupons,
      message: "Coupons retrieved successfully" 
    });
  } catch (error) {
    console.error("Error fetching coupons:", error.stack);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};
// Admin gets all coupons
// const getCoupons = async (req, res) => {
//   try {
//     const coupons = await Coupon.find();

//     if (!coupons || coupons.length === 0) {
//       return res.status(404).json({ message: "No coupons found" });
//     }

//     res.status(200).json({ coupons });
//   } catch (error) {
//     console.error("Error fetching coupons:", error.stack);
//     res.status(500).json({ message: "Server error" });
//   }
// };



module.exports = {
  createCoupon,
  getCoupons,
  applyCoupon,
  validateCoupon,
};

