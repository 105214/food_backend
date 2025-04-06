const Coupon = require("../models/couponModel.js");
const Cart = require("../models/cartModel.js");
const User = require("../models/userModel.js")
const Admin = require("../models/adminModel.js")
const Order=require("../models/orderModel.js")
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
    console.log("[DEBUG] Received data:", req.body);
    
    const { couponCode, orderId } = req.body;
    const userId = req.user.id;
    
    if (!couponCode) {
      return res.status(400).json({ message: "Coupon code is required" });
    }
    
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    if (!coupon) {
      return res.status(400).json({ message: "Invalid or expired coupon code" });
    }
    
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Ensure totalAmount is valid
    const currentTotal = parseFloat(order.totalAmount || 0);
    const discountValue = parseFloat(coupon.discount || 0);

    if (isNaN(currentTotal) || isNaN(discountValue)) {
      return res.status(400).json({ message: "Invalid order total or discount value" });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (currentTotal * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }

    if (coupon.maxDiscount && discountAmount > parseFloat(coupon.maxDiscount)) {
      discountAmount = parseFloat(coupon.maxDiscount);
    }

    const newTotal = Math.max(currentTotal - discountAmount, 0);

    console.log("[DEBUG] Current Total:", currentTotal);
    console.log("[DEBUG] Discount Type:", coupon.discountType);
    console.log("[DEBUG] Discount Value:", discountValue);
    console.log("[DEBUG] Calculated Discount:", discountAmount);
    console.log("[DEBUG] New Total:", newTotal);

    if (!isNaN(newTotal)) {
      order.appliedCoupon = couponCode;
      order.discountAmount = discountAmount;
      order.totalAmount = newTotal;
      await order.save();
    } else {
      return res.status(400).json({ message: "Error calculating total amount" });
    }

    res.status(200).json({ 
      message: "Coupon applied successfully", 
      newTotal,
      discountAmount
    });

  } catch (error) {
    console.error("[DEBUG] Error:", error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
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
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if coupon exists
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    
    // Delete the coupon
    await Coupon.findByIdAndDelete(id);
    
    res.status(200).json({
      message: "Coupon deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting coupon:", error.stack);
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
  deleteCoupon
};

