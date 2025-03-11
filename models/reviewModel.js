const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  
      required: true,
    },
    dishId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish", 
      required: true,
    },
    // restaurantId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Restaurant",
    //   required: true,
    // },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5, 
    },
    comment: {
      type: String,
      required: true,
      minlength: 5, 
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
