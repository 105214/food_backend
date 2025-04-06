const Dish = require("../models/dishModel.js")
const Owner=require("../models/ownerModel.js")
const Admin=require("../models/adminModel.js")
const bcrypt = require("bcrypt")
const fs = require('fs');
const path =require("path")
const {generateToken} = require("../utils/token.js")
const Restaurant = require("../models/restaurantModel.js")
const multer=require("../middleware/multer.js");
const { cloudinaryInstance } = require("../config/cloudinary.js");


const createDish = async (req, res) => {
  try {
    const { name, description, price, category, restaurantId, availability, ingredients } = req.body;
    
    // Extract owner ID from authenticated request
    const ownerId = req.owner?.id;
    
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized. Owner not authenticated." });
    }
    
    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        message: "Name, price, and category are required."
      });
    }
    
    // Validate price
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return res.status(400).json({ message: "Price must be a valid positive number" });
    }
    
    // Find restaurant first
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    
    // THEN check ownership after restaurant is found
    if (restaurant.ownerId.toString() !== ownerId) {
      return res.status(403).json({ message: "You don't have permission to add dishes to this restaurant" });
    }
    
    let DishImage;
    
    if (req.file) {
      try {
        const cloudinaryResponse = await cloudinaryInstance.uploader.upload(req.file.path);
        console.log("Cloudinary Response ===", cloudinaryResponse);
        DishImage = cloudinaryResponse.secure_url;
        
        // Delete file AFTER successful upload
        if (req.file.path) {
          fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting temporary file:", err);
          });
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(500).json({
          message: "Error uploading image to Cloudinary",
          error: cloudinaryError.message
        });
      }
    }
    
    // Create a new dish
    const newDish = new Dish({
      name,
      description,
      price,
      category,
      availability: availability === "true" || availability === true,
      ingredients,
      imageUrl: DishImage || "",
      ownerId,
      restaurantId
    });
    
    await newDish.save();
    
    res.status(201).json({ message: "Dish created successfully", dish: newDish });
  } catch (error) {
    console.error("Error creating dish:", error);
    res.status(500).json({ message: "Server error", error });
  }
};





// Ensure consistent response format in backend controller
const getAllDishes = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        message: "Unauthorized access" 
      });
    }

    const { category, restaurantId } = req.query;
    
    let filter = {};
    if (category) filter.category = category;
    if (restaurantId) filter.restaurantId = restaurantId;
    
    const dishes = await Dish.find(filter)
      .populate("restaurantId")
      .lean();  // Convert Mongoose documents to plain JavaScript objects
    
    // Validate dishes before sending
    const validDishes = dishes.map(dish => ({
      _id: dish._id,
      name: dish.name,
      description: dish.description || '',
      price: dish.price,
      imageUrl: dish.imageUrl || '/placeholder-dish.jpg',
      category: dish.category || 'Uncategorized',
      restaurantName: dish.restaurantId?.name || 'Unknown Restaurant'
    }));

    res.status(200).json({ 
      dishes: validDishes,
      count: validDishes.length,
      user: {
        id: req.user._id,
        name: req.user.name
      }
    });
  } catch (error) {
    console.error("Error in getAllDishes:", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

module.exports = { getAllDishes };
// const getAllDishes = async (req, res) => {
//   try {
//     const { category, restaurantId } = req.query;

//     let filter = {};
//     if (category) filter.category = category;
//     if (restaurantId) filter.restaurantId = restaurantId; 

//     const dishes = await Dish.find(filter).populate("restaurantId");
//     if (dishes.length === 0) {
//       return res.status(404).json({ message: "No dishes found" });
//     }

//     res.status(200).json({ dishes });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };







const getDishById = async (req, res) => {
  try {
    const id = req.params.id  // Get id from route params, not body

    const dish = await Dish.findById(id).populate("category")

    if (!dish) {
      return res.status(404).json({ message: "Dish not found" })
    }

    // Log the dish details to see what's happening with the image
    console.log('Dish details:', {
      _id: dish._id,
      name: dish.name,
      dishPic: dish.imageUrl,  // Log the image path/URL
    });

    res.status(200).json({ dish })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
}

// const getDishById = async (req, res) => {
//   try {
//     const id = req.params.id  // Get id from route params, not body

//     const dish = await Dish.findById(id).populate("category")

//     if (!dish) {
//       return res.status(404).json({ message: "Dish not found" })
//     }

//     res.status(200).json({ dish})
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error })
//   }
// }








const updateDish = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    // Extract fields from req.body
    const { name, description, price, category } = req.body;
    
    // Get owner ID from auth middleware
    const ownerId = req.owner.id;
    
    // Find the existing dish
    const dish = await Dish.findOne({ _id: id, ownerId: ownerId });
    
    if (!dish) {
      return res.status(404).json({ 
        message: "Dish not found or you don't have permission to update it" 
      });
    }
    
    // Create update data with fallbacks to existing values
    const updateData = {
      name: name || dish.name,
      description: description || dish.description,
      price: price ? Number(price) : dish.price,
      category: category || dish.category
    };
    
    // Handle image if present
    if (req.file) {
      try {
        // Upload to Cloudinary
        const result = await cloudinaryInstance.uploader.upload(req.file.path, {
          folder: 'dishes', // Organize images in a folder
          resource_type: 'image'
        });
        
        // Store the Cloudinary URL
        updateData.imageUrl = result.secure_url;
        console.log("Setting new image URL from Cloudinary:", updateData.imageUrl);
        
        // Optionally delete the local file
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ 
          message: "Failed to upload image to Cloudinary",
          error: uploadError.message
        });
      }
    }
    
    console.log("Update data:", updateData);
    
    // Use the $set operator for the update
    const updatedDish = await Dish.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    
    if (!updatedDish) {
      return res.status(500).json({ 
        message: "Failed to update dish in database" 
      });
    }
    
    res.status(200).json({
      message: "Dish updated successfully",
      dish: updatedDish
    });
  } catch (error) {
    console.error("Error updating dish:", error);
    res.status(500).json({
      message: "Server error while updating dish",
      error: error.message
    });
  }
};
// const updateDish = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     console.log("Request body:", req.body);
//     console.log("Request file:", req.file);
    
//     // Extract fields from req.body
//     const { name, description, price, category } = req.body;
    
//     // Get owner ID from auth middleware
//     const ownerId = req.owner.id;
    
//     // Find the existing dish
//     const dish = await Dish.findOne({ _id: id, ownerId: ownerId });
    
//     if (!dish) {
//       return res.status(404).json({ message: "Dish not found or you don't have permission to update it" });
//     }
    
//     // Create update data with fallbacks to existing values
//     const updateData = {
//       name: name || dish.name,
//       description: description || dish.description,
//       price: price ? Number(price) : dish.price,
//       category: category || dish.category
//     };
    
//     // Handle image if present
//     if (req.file) {
//       // Store the full URL or path as needed for your application
//       const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
//       updateData.imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
//       console.log("Setting new image URL:", updateData.imageUrl);
//     }
    
//     console.log("Update data:", updateData);
    
//     // Use the $set operator for the update
//     const updatedDish = await Dish.findByIdAndUpdate(
//       id,
//       { $set: updateData },
//       { new: true }
//     );
    
//     if (!updatedDish) {
//       return res.status(500).json({ message: "Failed to update dish in database" });
//     }
    
//     res.status(200).json({
//       message: "Dish updated successfully",
//       dish: updatedDish
//     });
//   } catch (error) {
//     console.error("Error updating dish:", error);
//     res.status(500).json({ 
//       message: "Server error while updating dish", 
//       error: error.message 
//     });
//   }
// };











const deleteDish = async (req, res) => {
  try {
    const { id } = req.params

    const deletedDish = await Dish.findByIdAndDelete(id)

    if (!deletedDish) {
      return res.status(404).json({ message: "Dish not found" })
    }

    res.status(200).json({ message: "Dish deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
}






const getOwnerDishes = async (req, res) => {
  console.log("hitted")
  try {
    // Change this line to use req.owner.id instead of req.owner?.id
    const ownerId = req.owner.id;
    console.log("ownerId",ownerId)
    console.log("Owner ID:", ownerId); // Add this for debugging
    
    // Find all dishes that belong to this owner
    const dishes = await Dish.find({ ownerId: ownerId }).populate("owner");
    console.log("dishes",dishes)
    console.log("Found dishes:", dishes.length); // Add this for debugging
    
    res.status(200).json({
      success: true,
      count: dishes.length,
      data: dishes
    });
  } catch (error) {
    console.error('Error fetching owner dishes:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};





const getDishDetails = async (req, res) => {
  try {
    const dishId = req.params.id;
    const ownerId = req.owner.id; // Assuming you have authentication middleware

    const dish = await Dish.findOne({ _id: dishId, ownerId: ownerId });
    
    if (!dish) {
      return res.status(404).json({ 
        success: false, 
        message: 'Dish not found or you do not have permission to view it' 
      });
    }

    res.status(200).json({
      success: true,
      dish
    });
  } catch (error) {
    console.error('Error fetching dish details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dish details',
      error: error.message
    });
  }
};
module.exports = {
  createDish,
  getAllDishes,
  getDishById,
  updateDish,
  deleteDish,
  getOwnerDishes,
  getDishDetails
}
