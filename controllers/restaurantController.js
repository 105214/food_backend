const Restaurant = require("../models/restaurantModel.js")
const Owner=require("../models/ownerModel.js")
const Admin=require("../models/adminModel.js")
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
 


// Controller function
// const getAllRestaurants = async (req, res, next) => {
//   try {
//     // Ensure the admin authentication middleware sets req.admin properly
    

//     console.log(req.admin, "admin"); // Debug log—prints the admin details.

//     // Retrieve all restaurant records from the database.
//     const restaurants = await Restaurant.find();

//     // Respond with the list of restaurants.
//     return res.status(200).json({ restaurants });
//   } catch (error) {
//     // Log the error and forward it to the centralized error handler.
//     console.error("Error fetching restaurants:", error);
//     next(error); // Pass the error to an error-handling middleware.
//   }
// };







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
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);
    
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    
    res.status(200).json({ restaurant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
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








// const updateRestaurant = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, address, description, location, openingHours, mobile, existingImageUrl } = req.body;

//     console.log("Update request received:");
//     console.log("ID:", id);
//     console.log("Full request body:", req.body);

//     if (!id) {
//       return res.status(400).json({ message: "Missing restaurant ID" });
//     }

//     const existingRestaurant = await Restaurant.findById(id);
//     if (!existingRestaurant) {
//       return res.status(404).json({ message: "Restaurant not found" });
//     }

//     // Use existing image if no new file is uploaded
//     let imageUrl = existingImageUrl || existingRestaurant.imageUrl || "";
//     if (req.file) {
//       imageUrl = `http://localhost:3001/uploads/${req.file.filename}`
     
//     }

//     // Create update object
//     const updateData = {
//       name,
//       address,
//       mobile,
//       description,
//       location,
//       openingHours,
//       imageUrl // Ensure imageUrl is included
//     };

//     // Preserve fields that shouldn't be lost during update
//     const preservedFields = ['ownerId', 'AdminId', 'menu', 'rating', 'deliveryFee'];
//     preservedFields.forEach(field => {
//       if (existingRestaurant[field]) {
//         updateData[field] = existingRestaurant[field];
//       }
//     });

//     console.log("Update payload:", updateData);

//     const updatedRestaurant = await Restaurant.findByIdAndUpdate(
//       id,
//       {$set :updateData,},
//       { new: true, runValidators: false } // Temporarily disable validators
//     );

//     if (!updatedRestaurant) {
//       return res.status(404).json({ message: "Restaurant not found after update attempt" });
//     }

//     console.log("Updated restaurant:", updatedRestaurant);

//     res.status(200).json({
//       message: "Restaurant updated successfully",
//       updatedRestaurant
//     });
//   } catch (error) {
//     console.error("Update error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };





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



















module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  
 
}
