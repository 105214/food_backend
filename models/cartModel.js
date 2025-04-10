const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true  // Indexing for better lookup performance
    },
    items: [
      {
        dishId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish",
          required: [true, "Dish ID is required"]
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Minimum quantity is 1"],
          max: [99, "Maximum quantity is 99"]
        },
        price: {
          type: Number,
          required: [true, "Price is required"],
          min: [0, "Price cannot be negative"]
        }
      }
    ],
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      default: 0,
      min: [0, "Total price cannot be negative"]
    }
  },
  { 
    timestamps: true,
    optimisticConcurrency: true  // Prevent conflicting updates
  }
);

// Pre-save middleware to update totalPrice and ensure all items have price
cartSchema.pre('save', function (next) {
  try {
    // Ensure all items have valid price and quantity
    this.items = this.items.map(item => {
      // Always explicitly set price to a number value
      item.price = Number(item.price);
      if (isNaN(item.price) || item.price === undefined) {
        console.warn(`Item with dishId ${item.dishId} is missing price. Setting default price to 0.`);
        item.price = 0; // Default price
      }
      
      item.quantity = Number(item.quantity);
      if (isNaN(item.quantity) || !item.quantity) {
        console.warn(`Item with dishId ${item.dishId} is missing quantity. Setting default quantity to 1.`);
        item.quantity = 1; // Default quantity
      }
      
      if (!item.dishId) {
        console.warn("Removing invalid item with missing dishId");
        return null; // Remove invalid items
      }
      return item;
    }).filter(item => item !== null); // Filter out invalid items

    // Recalculate total price
    this.totalPrice = this.items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
    this.totalPrice = Number(parseFloat(this.totalPrice).toFixed(2)) || 0; // Ensure totalPrice is a valid number with 2 decimal places
    next();
  } catch (error) {
    next(error);
  }
});

// Method to safely update cart items and total price
cartSchema.methods.updateItem = function (dishId, quantity, price) {
  console.log("updateItem called with:", { dishId, quantity, price });

  // Ensure price is a valid number
  price = Number(price);
  if (!dishId || quantity == null || price == null || quantity <= 0 || isNaN(price) || price < 0) {
    throw new Error("Invalid dishId, quantity, or price");
  }

  const existingItemIndex = this.items.findIndex(
    item => item.dishId && item.dishId.toString() === dishId.toString()
  );

  if (existingItemIndex !== -1) {
    this.items[existingItemIndex].quantity = Math.min(quantity, 99);
    this.items[existingItemIndex].price = price; // Ensure price is updated
  } else {
    this.items.push({ dishId, quantity: Math.min(quantity, 99), price });
  }

  // Update total price
  this.totalPrice = this.items.reduce(
    (total, item) => total + (Number(item.price) * Number(item.quantity)),
    0
  );
  this.totalPrice = Number(parseFloat(this.totalPrice).toFixed(2)) || 0; // Format to 2 decimal places

  return this;
};

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;























//cloudai
// const mongoose = require("mongoose");

// const cartSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: [true, "User ID is required"],
//       index: true  // Indexing for better lookup performance
//     },
//     items: [
//       {
//         dishId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Dish",
//           required: [true, "Dish ID is required"]
//         },
//         quantity: {
//           type: Number,
          
//           min: [1, "Minimum quantity is 1"],
//           max: [99, "Maximum quantity is 99"]
//         },
//         price: {
//           type: Number,
//           required: [true, "Price is required"],
//           min: [0, "Price cannot be negative"]
//         }
//       }
//     ],
//     totalPrice: {
//       type: Number,
//       required: [true, "Total price is required"],
//       default: 0,
//       min: [0, "Total price cannot be negative"]
//     }
//   },
//   { 
//     timestamps: true,
//     optimisticConcurrency: true  // Prevent conflicting updates
//   }
// );

// // Pre-save middleware to update totalPrice
// cartSchema.pre('save', function(next) {
//   try {
//     if (!Array.isArray(this.items) || this.items.length === 0) {
//       this.totalPrice = 0;
//     } else {
//       this.totalPrice = this.items.reduce((total, item) => {
//         const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
//         return isNaN(itemTotal) ? total : total + itemTotal;
//       }, 0);
//     }

//     this.totalPrice = Number(this.totalPrice) || 0;  // Ensure valid number
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Method to safely update cart items and total price
// cartSchema.methods.updateItem = function(dishId, quantity, price) {
//   if (!dishId || quantity == null || price == null || quantity < 0 || price < 0) {
//     throw new Error("Invalid dishId, quantity, or price");
//   }

//   const existingItemIndex = this.items.findIndex(
//     item => item.dishId.toString() === dishId.toString()
//   );

//   if (existingItemIndex !== -1) {
//     this.items[existingItemIndex].quantity = Math.min(quantity, 99);
    
//     // If quantity is 0 after updating, remove the item
//     if (this.items[existingItemIndex].quantity <= 0) {
//       this.items.splice(existingItemIndex, 1);
//     } else {
//       this.items[existingItemIndex].price = price;
//     }
//   } else {
//     if (quantity > 0) {
//       this.items.push({ dishId, quantity: Math.min(quantity, 99), price });
//     }
//   }

//   // Update total price
//   this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
//   this.totalPrice = Number(this.totalPrice) || 0;  // Ensure valid number

//   return this;
// };

// const Cart = mongoose.model("Cart", cartSchema);

// module.exports = Cart;


















// const mongoose = require("mongoose");

// const cartSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       index: true  // Indexing for better lookup performance
//     },
//     items: [
//       {
//         dishId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Dish",
//           required: [true, "Dish ID is required"]
//         },
//         quantity: {
//           type: Number,
//           required: [true, "Quantity is required"],
//           default: 1,
//           min: [1, "Minimum quantity is 1"],
//           max: [99, "Maximum quantity is 99"]
//         },
//         price: {
//           type: Number,
//           required: [true, "Price is required"],
//           min: [0, "Price cannot be negative"]
//         }
//       }
//     ],
//     totalPrice: {
//       type: Number,
//       default: 0,
//       min: [0, "Total price cannot be negative"]
//     }
//   },
//   {
//     timestamps: true,
//     optimisticConcurrency: true  // Prevent conflicting updates
//   }
// );

// // Pre-save middleware to update totalPrice
// cartSchema.pre('save', function(next) {
//   try {
//     if (!Array.isArray(this.items) || this.items.length === 0) {
//       this.totalPrice = 0;
//     } else {
//       this.totalPrice = this.items.reduce((total, item) => {
//         const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
//         return isNaN(itemTotal) ? total : total + itemTotal;
//       }, 0);
//     }
    
//     this.totalPrice = Number(this.totalPrice.toFixed(2)) || 0;  // Ensure valid number with 2 decimal places
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Method to safely update cart items and total price
// cartSchema.methods.updateItem = function(dishId, quantity, price) {
//   if (!dishId) {
//     throw new Error("Invalid dishId");
//   }
  
//   // Ensure quantity and price are valid numbers
//   const finalQuantity = Number(quantity) || 0;
//   const finalPrice = Number(price);
  
//   if (isNaN(finalPrice) || finalPrice < 0) {
//     throw new Error("Invalid price");
//   }

//   // Find existing item
//   const existingItemIndex = this.items.findIndex(
//     item => item.dishId && item.dishId.toString() === dishId.toString()
//   );

//   if (existingItemIndex !== -1) {
//     // Update existing item
//     if (finalQuantity <= 0) {
//       // Remove item if quantity is 0 or negative
//       this.items.splice(existingItemIndex, 1);
//     } else {
//       // Update quantity and price
//       this.items[existingItemIndex].quantity = Math.min(finalQuantity, 99);
//       this.items[existingItemIndex].price = finalPrice;
//     }
//   } else if (finalQuantity > 0) {
//     // Add new item
//     this.items.push({
//       dishId:item.dishId,
//       quantity:item,quantity,
//       price:item.price,
//     });
//   }

//   return this;
// };

// const Cart = mongoose.model("Cart", cartSchema);

// module.exports = Cart;






































// const mongoose = require("mongoose");


// const cartSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",  
//       required: true,
//     },
//     items: [
//       {
//         dishId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Dish", 
//           required: true,
//         },
//         quantity: {
//           type: Number,
//           required: true,
//           min: 1,  
//         },
//         price: {
//           type: Number,
//           required: true,
//           min:0,
//         },
//       },
//     ],
//     totalPrice: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//   },
//   { timestamps: true }
// );


// cartSchema.pre('save', function(next) {
//   this.totalPrice = this.items.reduce((total, dish) => total + (dish.price * dish.quantity), 0);
//   next();
// });




// const Cart = mongoose.model("Cart", cartSchema);

// module.exports = Cart;
