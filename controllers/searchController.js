const express = require('express');
const SearchItem = require('../models/searchModel');
const Restaurant = require('../models/restaurantModel');  // If needed for restaurant-based search
const router = express.Router();

const searchItems = async (req, res) => {
  try {
    const { query } = req.query;
    
    const foodItems = await SearchItem.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    });

    if (foodItems.length === 0) {
      return res.status(404).json({ 
        message: 'No matching food items found',
        foodItems: [],
        searchQuery: query
      });
    }

    res.json({ 
      foodItems, 
      searchQuery: query 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during search' });
  }
};


module.exports = {searchItems};



// const Search = async (req, res) => {
//   try {
//     const { query, cuisine, category, minPrice, maxPrice } = req.query;

//     const searchCriteria = {};

//     if (query) {
//       searchCriteria.$or = [
//         { name: { $regex: query, $options: 'i' } },
//         { description: { $regex: query, $options: 'i' } }
//       ];
//     }

//     console.log("Search Criteria:", JSON.stringify(searchCriteria, null, 2));  // Log the criteria

//     const foodItems = await SearchItem.find(searchCriteria)
//       .populate('restaurant')
//       .exec();

//     if (foodItems.length === 0) {
//       return res.status(404).json({ message: "No matching food items found" });
//     }

//     res.status(200).json({ foodItems });

//   } catch (error) {
//     console.error('Error in search:', error);
//     res.status(500).json({ message: "Server error" });
//   }
// };










// Search for food items
// const Search= async (req, res) => {
//   try {
//     const { query, cuisine, category, minPrice, maxPrice } = req.query;

//     const items = await SearchItem.find();
//     console.log(items);
    
//     // Build search criteria object
//     const searchCriteria = {};
//     if (query) {
//       // Search by food name or description (fuzzy search)
//       searchCriteria.$or = [
//         { name: { $regex: query, $options: 'i' } },
//         { description: { $regex: query, $options: 'i' } }
//       ];
//     }

//     if (cuisine) {
//       searchCriteria.cuisine = { $regex: cuisine, $options: 'i' };
//     }

//     if (category) {
//       searchCriteria.category = { $regex: category, $options: 'i' };
//     }

//     if (minPrice || maxPrice) {
//       searchCriteria.price = {};
//       if (minPrice) searchCriteria.price.$gte = minPrice;
//       if (maxPrice) searchCriteria.price.$lte = maxPrice;
//     }

//     // Find food items with criteria
//     console.log("Search Criteria:", JSON.stringify(searchCriteria, null, 2));

//     const foodItems = await SearchItem.find(searchCriteria)
//       .populate('restaurant')  // Optional: populate restaurant details if needed
//       .exec();

//     if (foodItems.length === 0) {
//       return res.status(404).json({ message: "No matching food items found" });
//     }

//     res.status(200).json({ foodItems });

//   } catch (error) {
//     console.error('Error in search:', error);
//     res.status(500).json({ message: "Server error" });
//   }
// }


