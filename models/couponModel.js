const mongoose = require("mongoose");
 
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,  
      trim: true,
    },
    discount: {
      type: Number,
      required: true,
      min: 0,
      max: 100, 
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);


couponSchema.methods.isValidCoupon = function () {
  const currentDate = new Date();
  return this.isActive && this.expiryDate > currentDate;
};


const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
