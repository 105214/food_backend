const Restaurant = require("../models/restaurantModel")
const Order = require("../models/orderModel")
const User = require("../models/userModel")
const Admin=require('../models/adminModel')
const Dish = require('../models/dishModel.js')
const bcrypt = require("bcrypt")
const multer=require("../middleware/multer.js");
const { cloudinaryInstance } = require("../config/cloudinary.js");
const {generateToken} = require("../utils/token.js")



const createAdmin=async(req,res,next)=>{
  try{
      const {name,email,password,profilePic,mobile}=req.body

      if(!name||!email||!password||!mobile){

        return res.status(400).json({ message: "All fields are required" })
      }

      const hashedPassword = bcrypt.hashSync(password, 10)
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(409).json({ message: "Admin with this email already exists" });
      }   
      let imageUrl=null

      if (req.file) {
        console.log("Uploaded File:", req.file);
        try {
          const cloudinaryResponse = await cloudinaryInstance.uploader.upload(req.file.path);
          console.log("Cloudinary Response ===", cloudinaryResponse);
          imageUrl = cloudinaryResponse.secure_url;
        } catch (uploadError) {
          console.error("Cloudinary Upload Error:", uploadError);
          return res.status(500).json({ message: "Image upload failed" });
        }
      }
      console.log("Received request:", req.body);
console.log("Received file:", req.file);


      // if (req.file) {
      //   console.log("image daTA",req.file)
      //     const cloudinaryResponse = await cloudinaryInstance.uploader.upload(req.file.path);
          
      //     console.log("Cloudinary Response ===", cloudinaryResponse);
      //     imageUrl = cloudinaryResponse.secure_url;
      
      // }
      const adminData = new Admin({
        name,
        email,
        password: hashedPassword,
        mobile,
        profilePic:imageUrl,
      })
      await adminData.save()

      const adminResponse = adminData.toObject()
    delete adminResponse.password;
    const token = generateToken(adminData._id,"admin")
    res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" })

    return res.json({ data: adminResponse, message: "New account created" })
  }catch(error)
  {
    return res.status(error.statuscode||500) .json({message:error.message||"internal server error"})
  }
}


const adminLogout=async(req,res,next)=>{

// Check if you're setting the cookie with the same options when logging in
// In your login handler
// const token = jwt.sign({ adminId: Admin._id }, process.env.JWT_SECRET_KEY, {
//   expiresIn: '24h' // or whatever expiration you want
// });
  try{
    // res.cookie('token', token, { 
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'Strict'
    // });
    res.clearCookie('token', { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Strict' 
    });
    return res.status(200).json({ message: 'admin Logged out successfully' });
  }catch(error){
    return res.status(500).json({ message: 'Server error', error });
  }
}


const adminLogin=async(req,res,next)=>{
  try {
    const { email, password } = req.body

    const admin = await Admin.findOne({ email })
    if (!admin) {
      return res.status(404).json({ message: "admin not found" })
    }

    const isMatch = await bcrypt.compare(password, admin.password)
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" })
        }

        const token = generateToken(admin._id)
    res.cookie("token", token)
    return res.json({ message: "Login successful",token})
}catch(error)
{
  res.status(500).json({ message: "Server error", error })
}
}



const adminProfile = async (req, res, next) => {
  try {
    console.log("Admin ID from request:", req.id); // Log extracted admin ID
    
    if (!req.id) {
      return res.status(401).json({ message: "Unauthorized: Missing admin ID" });
    }

    // Fetch admin data using id from the middleware
    const adminData = await Admin.findById(req.id).select("-password");

    if (!adminData) {
      return res.status(404).json({ message: "Admin not found" });
    }

    return res.json({ data: adminData, message: "Admin profile fetched" });
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

  // try {
  //   console.log("Received adminId:", req.Id);
  //   const admin = await Admin.findById(req._id).select('-password'); // Get admin data, excluding password
  //   console.log("adminID",req.adminId)
  //   if (!admin) {
  //     return res.status(404).json({ message: 'Admin not found' });
  //   }
  //   res.json({ data: admin, message: 'Admin profile fetched successfully' });
  // } catch (error) {
  //   return res.status(500).json({ message: error.message || 'Server error' });
  // }

  // try{
  //   const {_id}=req.body
  //   const adminData=await Admin.findById(_id)
  //   delete adminData._doc.password
  //   return res.json({data:adminData,message:"admin profile fetched"})
  // }catch(error){
  //    return res.status(error.statuscode||500).json({message:error.message||"internal server error"})
  // }
  



const addRestaurant = async (req, res,next) => {
  try {
    const { name, address, mobile,ownerId,description,location } = req.body

    if (!name || !address || !mobile||!ownerId||!description||!location ) {
      return res.status(400).json({ message: "All fields are required" })
    }

    const newRestaurant = new Restaurant({
      name,
      address,
      mobile,
      ownerId,
      description,
      location
    })

    await newRestaurant.save()
    res.status(201).json({ message: "Restaurant added successfully", newRestaurant })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
}



const addMenuItem = async (req, res,next) => {
 
  try {
  
    const { restaurantId, name, description, price, category } = req.body

    if (!restaurantId || !name || !price) {
      return res.status(400).json({ message: "Restaurant ID, name, and price are required" })
    }

    const menuItem = new Dish({
      restaurantId,
      name,
      description,
      price,
      category,
    })

    await menuItem.save()
    res.status(201).json({ message: "Menu item added successfully", Dish })
  } catch (error) {
   
    res.status(500).json({ message: "Server error", error })
  }
}




const getAllOrders = async (req, res,next) => {
  try {
    const orders = await Order.find().populate("user", "name email").populate("items.dishItem", "name price");
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
};


const updateOrderStatus = async (req, res,next) => {
  try {
    const { orderId, status } = req.body

    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.status(200).json({ message: "Order status updated", order })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
};


const getAllUsers = async (req, res,next) => {
  try {
    const users = await User.find()
    res.status(200).json({ users })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
}



const adminUpdate = async (req, res) => {
  try {
    const { name, email, mobile, _id } = req.body;
    const admin = await Admin.findById(_id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (mobile) admin.mobile = mobile;

    // Check if a new profile picture was uploaded
    if (req.file) {
      try {
        // Upload to Cloudinary
        const result = await cloudinaryInstance.uploader.upload(req.file.path, {
          folder: 'admin_profiles',
          width: 500,
          crop: "scale"
        });

        // Delete old image if exists
        if (admin.profilePic) {
          const publicId = admin.profilePic.split('/').pop().split('.')[0];
          await cloudinaryInstance.uploader.destroy(`admin_profiles/${publicId}`);
        }

        admin.profilePic = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(400).json({ 
          message: "Failed to upload image",
          error: uploadError.message 
        });
      }
    }

    await admin.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        profilePic: admin.profilePic,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// const adminUpdate = async (req, res) => {
//   try {
//     const { name, email, mobile, _id } = req.body;
//     const admin = await Admin.findById(_id);

//     if (!admin) {
//       return res.status(404).json({ message: "Admin not found" });
//     }

//     if (name) admin.name = name;
//     if (email) admin.email = email;
//     if (mobile) admin.mobile = mobile;

//     // Check if a new profile picture was uploaded
//     if (req.file)
//       try {
//         // Upload to Cloudinary
//         const result = await cloudinary.uploader.upload(req.file.path, {
//           folder: 'admin_profiles',
//           width: 500,
//           crop: "scale"
//         });


//     //    {
//     //   admin.profilePic = req.file.path;
//     //   console.log("admin profile pic",admin.profilePic) // Save file path
//     // }

//     if (admin.profilePic) {
//       const publicId = admin.profilePic.split('/').pop().split('.')[0];
//       await cloudinary.uploader.destroy(`admin_profiles/${publicId}`);
//     }

//     admin.profilePic = result.secure_url;
//   } catch (uploadError) {
//     console.error('Cloudinary upload error:', uploadError);
//     return res.status(400).json({ 
//       message: "Failed to upload image",
//       error: uploadError.message 
//     });
//   }

//     await admin.save();

//     res.status(200).json({
//       message: "Profile updated successfully",
//       user: {
//         id: admin._id,
//         name: admin.name,
//         email: admin.email,
//         profilePic: admin.profilePic,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
// const adminUpdate=async(req,res,next)=>{
//   try{
//     const {name,email,mobile,profilePic,_id}=req.body
//     const admin=await Admin.findById({_id})

//     if (!admin) {
//       return res.status(404).json({ message: 'admin not found' });
//     }
//     if (name) admin.name = name;
//     if (email) admin.email = email;
//     if (mobile)admin.mobile = mobile;
//     if  (profilePic)admin.profilePic=profilePic

//     await admin.save()

//     res.status(200).json({
//       message: 'Profile updated successfully',
//       user: {
//         id: admin._id,
//         name: admin.name,
//         email: admin.email,
        
//         phone: admin.phone,
//       }
//   })
//   }catch(error){
//     res.status(500).json({ message: 'Server error', error });
//   }
// }


const deleteAdminProfile = async (req, res,next) => {
  try {
    
   const {_id} = req.body;
   console.log(_id)
   
    const adminProfile = await Admin.findByIdAndDelete(_id);

    res.status(200).json({ message: 'Admin profile deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

const deleteRestaurant = async (req, res,next) => {
  try {
    const { restaurantId } = req.body

    const restaurant = await Restaurant.findByIdAndDelete(restaurantId)

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" })
    }

    res.status(200).json({ message: "Restaurant deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
}




const deleteMenuItem = async (req, res,next) => {
  try {
    const { dishId } = req.body

    const menuItem = await Dish.findByIdAndDelete(dishId)

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" })
    }

    res.status(200).json({ message: "Menu item deleted successfully" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error", error })
  }
}
module.exports = {
  createAdmin,
  adminLogin,
  adminLogout,
  adminProfile,
  adminUpdate,
  deleteAdminProfile,
  addRestaurant,
  addMenuItem,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  deleteRestaurant,
  deleteMenuItem,
}
