const User = require("../models/userModel.js");
// const cloudinary=require('../config/cloudinary.js')
const bcrypt = require("bcrypt")
const {generateToken} = require("../utils/token.js")
const Order = require("../models/orderModel.js")
const multer=require("../middleware/multer.js");
const Dish =require("../models/userModel.js")
const { cloudinaryInstance } = require("../config/cloudinary.js");

 
const userSignup = async (req, res, next) => {

  try {
    const { name, email, password, mobile,address,profilePic } = req.body;

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }
    
   
    let imageUrl

    if (req.file) {
      
        const cloudinaryResponse = await cloudinaryInstance.uploader.upload(req.file.path);
        
        console.log("Cloudinary Response ===", cloudinaryResponse);
        imageUrl = cloudinaryResponse.secure_url;
    
    }

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    console.log("imageurl",imageUrl)

    const userData = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      address,
      profilePic:imageUrl, //imageUrl, // Use the uploaded image URL or default image
    });
 
    
    await userData.save();

    const userResponse = userData.toObject();
    delete userResponse.password;

    const token = generateToken(userData._id);
    res.cookie("token", token);

    return res.json({ data: userResponse, message: "New account created" });
  } catch (error) {
    console.log(error,"error");
    
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
};




const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = generateToken(user._id)
    res.cookie("token", token)

    return res.json({ message: "Login successful","token":token})
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
}







  
const getProfile = async (req, res) => {
  try {
      const id = req.user.id; // ✅ Get user ID from token

      if (!id) {
          return res.status(400).json({ message: "User ID missing", success: false });
      }

      const userData = await User.findById(id);
      
      if (!userData) {
          return res.status(404).json({ message: "User not found", success: false });
      }

      const { password, ...userWithoutPassword } = userData._doc;
      
      return res.json({ data: userWithoutPassword, message: "Profile fetched successfully" });
  } catch (error) {
      return res.status(500).json({ message: error.message || "Internal Server Error", success: false });
  }
};



// const getProfile=async(req,res,next)=>{
//   console.log("hitted")
//   try{
//     const id=req.id
//     const userData=await User.findById(id)
//     delete userData._doc.password
//     return res.json({data:userData,message:"user profile fetched"})
//   }catch(error){
//      return res.status(error.statuscode||500).json({message:error.message||"internal server error"})
//   }
//   }


const updateProfile = async (req, res) => {
  try {
    const { name, email,address, mobile,_id } = req.body;

    const user = await User.findById({_id});

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile)user.mobile = mobile;
    if(address)user.address=address;
    

    if (req.file) {
      try {
        // Upload to Cloudinary
        const result = await cloudinaryInstance.uploader.upload(req.file.path, {
          folder: 'user_profiles',
          width: 500,
          crop: "scale"
        });

        // Delete old image if exists
        if (user.profilePic) {
          const publicId = user.profilePic.split('/').pop().split('.')[0];
          await cloudinaryInstance.uploader.destroy(`user_profiles/${publicId}`);
        }

        user.profilePic = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(400).json({ 
          message: "Failed to upload image",
          error: uploadError.message 
        });
      }
    }

    await user.save();
  

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}




// const getOrderHistory = async (req, res, next) => {
//   try {
//     const userId=req.body
//     const orders = await Order.find({userId})
//     //  userId: req.userId
//     res.status(200).json({ orders });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error })
//   }
// }

// Backend (Express) logout function

const userLogout = (req, res) => {
  console.log("Logout endpoint hit");

  try {
    const token = req.headers.authorization?.split(" ")[1]; // Get token from headers
    if (!token) {
      return res.status(401).json({ message: "No authentication token found" });
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict"
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};



// const userLogout = (req, res) => {
//   try {
   
//     res.clearCookie('token', { 
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production', 
//       sameSite: 'Strict' 
//     });

//     return res.status(200).json({ message: 'Logged out successfully' });
//   } catch (error) {
//     return res.status(500).json({ message: 'Server error', error });
//   }
// }



const deleteUserProfile = async (req, res) => {
  try {
    
   const {_id} = req.body;
   console.log(_id)
    // Find and delete the user by userId
    const userProfile = await User.findByIdAndDelete(_id);

    // if (!userProfile) {
    //   return res.status(404).json({ message: 'User not found' });
    // }

    // Send a response confirming the deletion
    res.status(200).json({ message: 'User profile deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};


module.exports = {
  userSignup,
  userLogin,
  userLogout,
  getProfile,
  updateProfile,
  deleteUserProfile,
  
}

































