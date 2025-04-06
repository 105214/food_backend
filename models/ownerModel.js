const mongoose = require("mongoose");

 
const ownerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      // unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
      match: [/^\d{10,15}$/, "Please provide a valid phone number"],
    },
    restaurantName: {
      type: String,
      trim: true,
    },
    restaurantLocation: {
      type: String,
      trim: true,
    },
    restaurantDescription: {
      type: String,
      default: "",
    },
    profilePic:{
      type:String
    },
    restaurantImage: {
      type: String,  
    },
    isActive: {
      type: Boolean,
      default: true,  
    },
    menu: [
      {
        foodId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",  
        },
        price: {
          type: Number,
          // required: true,
        },
        available: {
          type: Boolean,
          default: true, 
        },
      },
    ],
   role: {
    type:String,
    enum: ['user', 'owner'],
    default: 'owner'
    },
  },
  { timestamps: true }
);


// ownerSchema.methods.addFoodItem = async function (foodId, price) {
//   const existingFood = this.menu.find((item) => item.foodId.toString() === foodId);
//   if (existingFood) {
//     throw new Error("Food item already exists in the menu.");
//   }

//   this.menu.push({ foodId, price });
//   await this.save();
// };


// ownerSchema.methods.removeFoodItem = async function (foodId) {
//   this.menu = this.menu.filter((item) => item.foodId.toString() !== foodId);
//   await this.save();
// };



// const Owner = mongoose.model("Owner", ownerSchema);

// module.exports = Owner;
const Owner=mongoose.model("Owner",ownerSchema)
module.exports=Owner