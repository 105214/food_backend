const mongoose = require('mongoose');
const Restaurant = require("../models/restaurantModel.js")
const Owner=require("../models/ownerModel.js")
const Admin=require("../models/adminModel.js")
const Dish=require("../models/dishModel.js")
const bcrypt = require("bcrypt")
const fs =require('fs')
const {generateToken} = require("../utils/token.js")
const multer=require("../middleware/multer.js");
const { cloudinaryInstance } = require("../config/cloudinary.js");







const createRestaurant = async (req, res,next) => {
console.log("create restaurant hitted")

  try {
      const ownerId=req.owner.id
      console.log('ownerid',ownerId)
    const { name, address, mobile,location,description, imageUrl,openingHours } = req.body
    


    if (!ownerId) {
      return res.status(401).json({ message: "User is not authenticated" });
    }

    if (!name || !address || !mobile||!location||!description) {
      return res.status(400).json({ message: "All fields are required" })
    }
    let restaurantImage

    if (req.file) {
      
        const cloudinaryResponse = await cloudinaryInstance.uploader.upload(req.file.path);
        
        console.log("Cloudinary Response ===", cloudinaryResponse);
        restaurantImage = cloudinaryResponse.secure_url;
    
    }
    const newRestaurant = new Restaurant({
      name,
      address,
      mobile,
      location,
      description,
      imageUrl:restaurantImage,
      ownerId, 
      openingHours, 
    })

    
    await newRestaurant.save()
    
    return res.status(201).json({ message: "Restaurant created successfully", newRestaurant })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error", error })
  }
}
 










const getAllRestaurants = async (req, res, next) => {
  try {
    // Retrieve all restaurant records without authentication check
    const restaurants = await Restaurant.find();
    return res.status(200).json({ restaurants });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ message: "Server error", error });
  }
};




const getRestaurantById = async (req, res) => {
  try {
    const { ownerId } = req.params;
    console.log("Received ownerId:", ownerId);
    
    // Validate if ownerId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      console.log("Invalid ObjectId format");
      return res.status(400).json({ message: "Invalid owner ID format" });
    }
    
    const objectIdOwnerId = new mongoose.Types.ObjectId(ownerId);
    console.log("Converted to ObjectId:", objectIdOwnerId);
    
    // Change 'owner' to 'ownerId' to match your schema
    const restaurant = await Restaurant.findOne({ ownerId: objectIdOwnerId });
    console.log("Found restaurant:", restaurant);
    
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    
    res.status(200).json({ restaurant });
  } catch (error) {
    console.error("Error in getRestaurantById:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};






const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, description, location, openingHours, mobile, existingImageUrl } = req.body;
    
    console.log("Update request received:");
    console.log("ID:", id);
    console.log("Full request body:", req.body);
    console.log("File:", req.file);
    
    if (!id) {
      return res.status(400).json({ message: "Missing restaurant ID" });
    }
    
    const existingRestaurant = await Restaurant.findById(id);
    if (!existingRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    
    // Handle image upload
    let imageUrl = existingImageUrl || existingRestaurant.imageUrl || "";
    
    if (req.file) {
      try {
        // Upload to Cloudinary
        const result = await cloudinaryInstance.uploader.upload(req.file.path, {
          folder: 'restaurants',
          use_filename: true,
          unique_filename: true,
        });
        
        console.log("Cloudinary upload result:", result);
        
        // Use the Cloudinary URL
        imageUrl = result.secure_url;
        
        // Remove temp file after upload
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        
        // Fallback to local file if Cloudinary fails
        imageUrl = `${req.file.filename}`;  // Store just the filename
      }
    }
    
    // Create update object
    const updateData = {
      name,
      address,
      mobile,
      description,
      location,
      openingHours,
      imageUrl // Ensure imageUrl is included
    };
    
    // Preserve fields that shouldn't be lost during update
    const preservedFields = ['ownerId', 'AdminId', 'menu', 'rating', 'deliveryFee'];
    preservedFields.forEach(field => {
      if (existingRestaurant[field]) {
        updateData[field] = existingRestaurant[field];
      }
    });
    
    console.log("Update payload:", updateData);
    // Add this before the findById operation in your updateRestaurant controller
console.log(`Attempting to find restaurant with ID: ${id}`);
const allRestaurants = await Restaurant.find({ ownerId: req.ownerId });
console.log(`Owner ${req.ownerId} has ${allRestaurants.length} restaurants:`);

console.log("All restaurants in the database:");
const allRestaurantsInDb = await Restaurant.find({});
console.log(`Found ${allRestaurantsInDb.length} total restaurants in database`);
allRestaurantsInDb.forEach(r => console.log(`- ${r._id}: ${r.name} (Owner: ${r.ownerId})`));

// Check if the restaurant exists at all
const targetRestaurant = await Restaurant.findById(id);
console.log(`Target restaurant exists: ${!!targetRestaurant}`);
if (targetRestaurant) {
  console.log(`Target restaurant owner: ${targetRestaurant.ownerId}, Request owner: ${req.ownerId}`);
}
allRestaurants.forEach(r => console.log(`- ${r._id}: ${r.name}`));
    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: false } // Temporarily disable validators
    );
    
    if (!updatedRestaurant) {
      return res.status(404).json({ message: "Restaurant not found after update attempt" });
    }
    
    console.log("Updated restaurant:", updatedRestaurant);
    
    res.status(200).json({
      message: "Restaurant updated successfully",
      updatedRestaurant
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};







//to show owner restaurants
const getRestaurantsByOwnerId = async (req, res) => {
  try {
    const ownerId = req.params.id;
    const restaurants = await Restaurant.find({ ownerId: ownerId });
    console.log(`Found ${restaurants.length} restaurants for owner ${ownerId}`);
    
    return res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    console.error("Error fetching owner's restaurants:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};


// Add this new controller function to your backend
const getSingleRestaurant = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    
    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};











const deleteRestaurant = async (req, res, next) => {
  console.log("delete hitting")
  try {
    const { id } = req.params;
    console.log("Iddd", req.params) // Fixed syntax error
    
    const deletedRestaurant = await Restaurant.findByIdAndDelete(id);
    if (!deletedRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.status(200).json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
}






// View restaurant for user
const viewRestaurantForUser = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    
    const restaurant = await Restaurant.findById(restaurantId);
    
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error("Error fetching restaurant for user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};




// Get all restaurants for users
const getAllRestaurantsForUser = async (req, res) => {
  try {
    // We can add filters or sorting options based on query parameters
    const { location, rating, search } = req.query;
    let query = {};
    
    // Add filters if provided
    if (location) {
      query.location = location;
    }
    
    if (rating) {
      query.rating = { $gte: parseInt(rating) };
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Find restaurants with optional filters
    const restaurants = await Restaurant.find(query);
    
    // Return the filtered restaurants
    return res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });
  } catch (error) {
    console.error("Error fetching restaurants for user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};



// Make sure this is in your restaurant controller file
// const restaurantMenu = async (req, res) => {
//   try {
//     const { restaurantId } = req.params;
    
//     console.log('Fetching menu for restaurant ID:', restaurantId);
    
//     // Find the restaurant and its menu items
//     const restaurant = await Restaurant.findById(restaurantId).select('name menu');
    
//     if (!restaurant) {
//       console.log('Restaurant not found');
//       return res.status(404).json({
//         success: false,
//         message: 'Restaurant not found'
//       });
//     }
    
//     console.log('Restaurant found:', restaurant.name);
//     console.log('Menu items count:', restaurant.menu ? restaurant.menu.length : 0);
    
//     return res.status(200).json({
//       success: true,
//       data: {
//         restaurantName: restaurant.name,
//         menu: restaurant.menu || []
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching restaurant menu:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error fetching restaurant menu'
//     });
//   }
// };


const restaurantMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    
    console.log('Fetching menu for restaurant ID:', restaurantId);
    
    // Find the restaurant
    const restaurant = await Restaurant.findById(restaurantId).select('name');
    
    if (!restaurant) {
      console.log('Restaurant not found');
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    // Find all dishes that reference this restaurant
    const menuItems = await Dish.find({ restaurantId: restaurantId });
    
    console.log('Restaurant found:', restaurant.name);
    console.log('Menu items count:', menuItems.length);
    
    return res.status(200).json({
      success: true,
      data: {
        restaurantName: restaurant.name,
        menu: menuItems
      }
    });
  } catch (error) {
    console.error('Error fetching restaurant menu:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching restaurant menu'
    });
  }
};





module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantsByOwnerId,
  getSingleRestaurant,
 viewRestaurantForUser,
 getAllRestaurantsForUser,
 restaurantMenu,
}
