const Dish = require("../models/dishModel.js")
const Owner=require("../models/ownerModel.js")
const Admin=require("../models/adminModel.js")
const bcrypt = require("bcrypt")
const {generateToken} = require("../utils/token.js")
const Restaurant = require("../models/restaurantModel.js")
const multer=require("../middleware/multer.js");
const { cloudinaryInstance } = require("../config/cloudinary.js");


const createDish = async (req, res) => {
  try {
    const { name, description, price, category,restaurantId} = req.body;

    // Extract owner ID from authenticated request
    const ownerId = req.owner?.id;

    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized. Owner not authenticated." });
    }
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({
        message: "Name, price, and category are required."
      });
    }
    let DishImage

    if (req.file) {
      try {
        const cloudinaryResponse = await cloudinaryInstance.uploader.upload(req.file.path);
        console.log("Cloudinary Response ===", cloudinaryResponse);
        DishImage = cloudinaryResponse.secure_url;
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        return res.status(500).json({ 
          message: "Error uploading image to Cloudinary", 
          error: cloudinaryError.message 
        });
      }
    }
    // const images = req.file ? `/uploads/${req.file.filename}` : "";
    // Create a new dish without restaurantId
    const newDish = new Dish({
      name,
      description,
      price,
      category,
      imageUrl:DishImage,
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






const getAllDishes = async (req, res) => {
  try {
    const { category, restaurantId } = req.query;

    let filter = {};
    if (category) filter.category = category;
    if (restaurantId) filter.restaurantId = restaurantId; 

    const dishes = await Dish.find(filter).populate("restaurantId");
    if (dishes.length === 0) {
      return res.status(404).json({ message: "No dishes found" });
    }

    res.status(200).json({ dishes });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// const getAllDishes = async (req, res) => {
//   try {
//     const { category } = req.query;
//    
//     let dishes;
//     if (category) {
//       dishes = await Dish.find({ category }).populate('category');
//     } else {
//       dishes = await Dish.find().populate('category');
//     }

//     if (dishes.length === 0) {
//       return res.status(404).json({ message: "No dishes found" });
//     }

//     res.status(200).json({ dishes });
//   } catch (error) {
//     console.error("Error fetching dishes:", error);
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

    res.status(200).json({ dish})
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
}
// const getDishById = async (req, res) => {
//   try {
//     const {id} = req.params

//     const dish = await Dish.findById( dishId).populate("category")

//     if (!dish) {
//       return res.status(404).json({ message: "Dish not found" })
//     }

//     res.status(200).json({ dish })
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error })
//   }
// }
const updateDish = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, imageUrl, restaurantId } = req.body;

    // Ensure the dish exists
    const dish = await Dish.findById(id);
    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    // Ensure restaurantId is not changed
    if (restaurantId && restaurantId !== dish.restaurantId.toString()) {
      return res.status(400).json({ message: "Cannot change associated restaurant" });
    }

    const updatedDish = await Dish.findByIdAndUpdate(
      id,
      { name, description, price, category, imageUrl },
      { new: true }
    );

    res.status(200).json({ message: "Dish updated successfully", dish: updatedDish });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// const updateDish = async (req, res) => {
//   console.log("Received Headers:", req.headers);
// console.log("Received Cookies:", req.cookies);

//   try {
//     const { id } = req.params; 
// console.log("backend dishId",id)
  
//     const { name, description, price, category, imageUrl } = req.body;


//     const updatedDish = await Dish.findByIdAndUpdate(
//       id,
//       { name, description, price, category, imageUrl },
//       { new: true } 
//     );

 
//     if (!updatedDish) {
//       return res.status(404).json({ message: "Dish not found" });
//     }

    
//     res.status(200).json({ message: "Dish updated successfully", dish: updatedDish });

//   } catch (error) {
   
//     res.status(500).json({ message: "Server error", error: error.message });
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

module.exports = {
  createDish,
  getAllDishes,
  getDishById,
  updateDish,
  deleteDish,
}
