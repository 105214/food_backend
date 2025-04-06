const Review = require("../models/reviewModel.js")
const User = require("../models/userModel.js")
const Dish =require("../models/dishModel.js")
const restaurant=require("../models/restaurantModel.js")
const bcrypt = require("bcrypt")
const {generateToken} = require("../utils/token.js")



const addReview = async (req, res) => {
  try {
  // Get from request body
    const { rating, comment,dishId } = req.body;
    const userId = req.user.id;

    console.log("Dish ID received:", dishId);
    console.log("Review details", req.body);

    if (!dishId || !rating || !comment) {
      return res.status(400).json({ message: "Dish ID, rating, and comment are required." });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    // Get the dish
    const dish = await Dish.findById(dishId);
    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    // Check for existing review
    const existingReview = await Review.findOne({ dishId, userId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this dish." });
    }

    // Create review
    const review = new Review({ dishId, userId, rating, comment });
    await review.save();
    
    // // Update dish rating
    // await updateDishRating(dishId);

    return res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};









// const addReview = async (req, res) => {
//   try {
//     const { dishId, rating, comment, restaurantId } = req.body
//    console.log("details",req.body)
//     const userId = req.user.id

  
//     if (!dishId || !rating || !comment||!restaurantId) {
//       return res.status(400).json({ message: "Food ID, rating, and comment are required." })
//     }

//     if (rating < 1 || rating > 5) {
//       return res.status(400).json({ message: "Rating must be between 1 and 5." })
//     }

    
//     const dish = await Dish.findById(dishId)
//     if (!dish) {
//       return res.status(404).json({ message: "Food item not found" })
//     }

    
//     const existingReview = await Review.findOne({ dishId, userId })
//     if (existingReview) {
//       return res.status(400).json({ message: "You have already reviewed this food item." })
//     }

 
//     const review = new Review({
//       dishId,
//       userId,
//       restaurantId,
//       rating,
//       comment,
//     })

//     await review.save()

    
//     await updateDishRating(dishId)

//     return res.status(201).json({ message: "Review added successfully", review })
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ message: "Server error", error })
//   }
// }









const getDishReviews = async (req, res) => {
  try {
    const {dishId} = req.params;

    
    if (!dishId) {
      return res.status(400).json({ message: "Food ID is required." });
    }

 
    const reviews = await Review.find({ dish}).populate("userId", "name profilePic")

    if (reviews.length === 0) {
      return res.status(404).json({ message: "No reviews found for this food item." })
    }

    return res.status(200).json({ reviews })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error", error })
  }
}

const getUserReviews = async (req, res) => {
  try {
      const dishId = req.params.id;
      
      // Fetch reviews for the specific dish, populating user details
      const reviews = await Review.find({ dishId: dishId })
          .populate('userId', 'name') // Populate user name if needed
          .sort({ createdAt: -1 }); // Sort by most recent first

      res.status(200).json(reviews);
  } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: "Server error fetching reviews", error: error.message });
  }
}
// const getUserReviews = async (req, res) => {
//   try {
//     const userId = req.user.id;  


//     const reviews = await Review.find({ userId }).populate("dishId", "name price category")

//     if (reviews.length === 0) {
//       return res.status(404).json({ message: "You haven't reviewed any food items." })
//     }

//     return res.status(200).json({ reviews })
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ message: "Server error", error })
//   }
// };


const updateReview = async (req, res) => {
  console.log("Update review hit")
  try {
     const { reviewId, dishId, rating, comment } = req.body;
     const userId = req.user.id; // Assuming user info is attached to req.user
     console.log("Request body:", req.body);

     // Check for missing fields
     if (!reviewId || !dishId || !rating || !comment) {
       return res.status(400).json({ message: "Review ID, Food ID, rating, and comment are required." });
     }

     // Validate rating range
     if (rating < 1 || rating > 5) {
       return res.status(400).json({ message: "Rating must be between 1 and 5." });
     }

     // Find the existing review for the user and dish
     let review = await Review.findOne({ _id: reviewId, dishId, userId });

     if (review) {
       // If review exists, update it
       review.rating = rating;
       review.comment = comment;
       await review.save();

       return res.status(200).json({ message: "Review updated successfully", review });
     } else {
       return res.status(404).json({ message: "Review not found" });
     }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
// const updateReview = async (req, res) => {
//   console.log("hitted")
//   try {
    
//     const { dishId, rating, comment} = req.body;
//     const userId  = req.user.id; // Assuming user info is attached to req.user
//     console.log(dishId)
//     // Check for missing fields
//     if (!dishId || !rating || !comment) {
//       return res.status(400).json({ message: "Food ID, rating, and comment are required." });
//     }

//     // Validate rating range
//     if (rating < 1 || rating > 5) {
//       return res.status(400).json({ message: "Rating must be between 1 and 5." });
//     }

//     // Find the existing review for the user and dish
//     let review = await Review.findOne({ dishId,});

//     if (review) {
//       // If review exists, update it
//       review.rating = rating;
//       review.comment = comment;
//       await review.save();

//       return res.status(200).json({ message: "Review updated successfully", review });
//     } else {
//       // If review doesn't exist, create a new review
//       review = new Review({
//         dishId,
//         userId,
//         rating,
//         comment,
        
//       });

//       await review.save();

//       return res.status(201).json({ message: "Review added successfully", review });
//     }

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error", error });
//   }
// }










const deleteReview = async (req, res) => {
  try {
    const { dishId, reviewId } = req.body;

    if (!reviewId) {
      return res.status(400).json({ message: "Review ID is required." });
    }

    // Find and delete the review
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Optional: If you want to update dish rating, you'll need to define the updateDishRating function
    // For now, we'll comment it out or remove it
    // if (dishId) {
    //   await updateDishRating(dishId);
    // }

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error in deleteReview:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// const deleteReview = async (req, res) => {
//   try {
//     const { dishId, reviewId } = req.body; // Expect both `dishId` and `reviewId` in the request body

//     if (!reviewId) {
//       return res.status(400).json({ message: "Review ID is required." });
//     }

//     // Find and delete the review
//     const review = await Review.findByIdAndDelete(reviewId);
//     if (!review) {
//       return res.status(404).json({ message: "Review not found." });
//     }

//     // Update the dish rating after the review is deleted
//     if (dishId) {
//       await updateDishRating(dishId);
//     }

//     return res.status(200).json({ message: "Review deleted successfully" });
//   } catch (error) {
//     console.error("Error in deleteReview:", error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };




module.exports = {
  addReview,
  getDishReviews,
  getUserReviews,
  updateReview,
  deleteReview,
};
