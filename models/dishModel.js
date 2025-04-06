const mongoose=require('mongoose')



const dishSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      // unique: true,  
      trim: true,   
    },
    description: {
      type: String,
      trim: true,  
    },
    price: {
      type: Number,
      min: 0,  
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant", 
      required: true  // Ensure every dish belongs to a restaurant
    },
    ownerId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Owner",
      required:true,
    },
    category: {
      type: String,
      enum: ["Rice", "Veg", "Non-veg", "Drinks","meat","fish"] // Restrict category to predefined options
    },
    imageUrl: {
      type: String,
      default: "",  
    },
    // restaurantId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Restaurant", 
      
    // },
    availability: {
      type: Boolean,
      default: true,   
    },
    ingredients: {
      type: [String],  
      
    },
    ratings: {
      type: [Number],  
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }  
);




const Dish = mongoose.model("Dish", dishSchema);

module.exports = Dish;
