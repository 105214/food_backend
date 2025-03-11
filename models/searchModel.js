const mongoose = require('mongoose');

const searchItemSchema = new mongoose.Schema({
name:{ 
     type: String,
     required: true
     },
     description: String,
price:{ 
    type: Number,
     required: true
     },
   category: String, 
   cuisine: String,  
restaurant:{ 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'Restaurant'
     }, // Reference to the restaurant
    image: String, // URL of the image
isActive:{
     type: Boolean,
      default: true
     },
}, { timestamps: true });

const SearchItem = mongoose.model('SearchItem', searchItemSchema);

module.exports = SearchItem;
