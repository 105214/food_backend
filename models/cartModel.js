const mongoose = require("mongoose");


const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  
      required: true,
    },
    items: [
      {
        dishId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Dish", 
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,  
        },
        price: {
          type: Number,
          required: true,
          min:0,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);


cartSchema.pre('save', function(next) {
  this.totalPrice = this.items.reduce((total, dish) => total + (dish.price * dish.quantity), 0);
  next();
});

// cartSchema.methods.calculateTotalPrice = function () {
//   this.totalPrice=this.items.reduce((total,dish)=>total+dish.price,0)
// }




// cartSchema.methods.calculateTotalPrice = async function () {
//   let total = 0;
//   for (let item of this.items) {
//     const dishItem = await mongoose.model("Food").findById(item.dishId);
//     total += dishItem.price * item.quantity;  
//   }
//   this.totalPrice = total;
//   await this.save();
// };


const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
