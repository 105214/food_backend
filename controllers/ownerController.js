
const Order = require("../models/orderModel.js")
const Owner=require("../models/ownerModel.js")
const Restaurant = require("../models/restaurantModel")
const bcrypt = require("bcrypt")
const multer=require("../middleware/multer.js");
const {generateToken} = require("../utils/token.js")
const { cloudinaryInstance } = require("../config/cloudinary.js");


// 
const createOwner=async(req,res,next)=>{
  console.log(req.body)
  try{
      const {name,email,password,profilePic,mobile}=req.body

      if(!name||!email||!password||!mobile){

        return res.status(400).json({ message: "All fields are required" })
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
      const hashedPassword = bcrypt.hashSync(password, 10)

      const ownerData = new Owner({
        name,
        email,
        password: hashedPassword,
        mobile,
        profilePic:imageUrl,
      })
      
      await ownerData.save()
 console.log(ownerData)


      const ownerResponse = ownerData.toObject()
    delete ownerResponse.password;
    const token = generateToken(ownerData._id)
    res.cookie("token", token)
 console.log("owner token",token)
    return res.json({ data: ownerResponse,token, message: "New account created" })
  }catch(error)
  {
    return res.status(error.statuscode||500) .json({message:error.message||"internal server error"})
  }
}


const ownerLogout=async(req,res,next)=>{


  try{
    res.clearCookie('token', { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Strict' 
    });
    return res.status(200).json({ message: 'owner Logged out successfully' });
  }catch(error){
    return res.status(500).json({ message: 'Server error', error });
  }
}


const ownerLogin=async(req,res,next)=>{
  try {
    const { email, password } = req.body

    const owner = await Owner.findOne({ email })
    if (!owner) {
      return res.status(404).json({ message: "owner not found" })
    }

    const isMatch = await bcrypt.compare(password, owner.password)
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" })
        }

        const token = generateToken(owner._id)
    res.cookie("token", token)
    return res.json({ message: "Login successful",token})
}catch(error)
{
  res.status(500).json({ message: "Server error", error })
}
}



const ownerProfile=async(req,res,next)=>{
  try{
    const {_id}=req.body
    
    const ownerData=await Owner.findById({_id})
    delete ownerData._doc.password
    return res.json({data:ownerData,message:"owner profile fetched"})
  }catch(error){
     return res.status(error.statuscode||500).json({message:error.message||"internal server error"})
  }
  
}

const ownerUpdate=async(req,res,next)=>{
  try{
    const {name,email,mobile,profilePic,_id}=req.body
    const owner=await Owner.findById({_id})

    if (!owner) {
      return res.status(404).json({ message: 'admin not found' });
    }
    if (name) owner.name = name;
    if (email) owner.email = email;
    if (mobile)owner.mobile = mobile;
    if  (profilePic)owner.profilePic=profilePic

    await owner.save()

    res.status(200).json({
      message: 'Profile updated successfully',
      owner: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        
        phone: owner.phone,
      }
  })
  }catch(error){
    res.status(500).json({ message: 'Server error', error });
  }
}


const deleteOwner = async (req, res,next) => {
  try {
    
   const {_id} = req.body;
  
    const ownerProfile = await Owner.findByIdAndDelete({_id});

    res.status(200).json({ message: 'owner profile deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
}


const addDishItem = async (req, res, next) => {
  try {
    const { name, description, price, category, dishPic } = req.body

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" })
    }
    let imageUrl

    if (req.file) {
      
        const cloudinaryResponse = await cloudinaryInstance.uploader.upload(req.file.path);
        
        console.log("Cloudinary Response ===", cloudinaryResponse);
        imageUrl = cloudinaryResponse.secure_url;
    
    }

    const dishItem = new Food({
      name,
      description,
      price,
      category,
      dishPic:imageUrl,
    })

    await dishItem.save();
    res.status(201).json({ message: "Food item added successfully1", data: dishItem })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
}


const updateDishItem = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, description, price, category, imageUrl } = req.body

    const dishItem = await dish.findById(id)

    if (!dishItem) {
      return res.status(404).json({ message: "Food item not found" })
    }

   
    if (name) dishItem.name = name
    if (description) dishItem.description = description
    if (price) dishItem.price = price
    if (category) dishItem.category = category
    if (imageUrl) dishItem.imageUrl = imageUrl

    await dishItem.save()
    res.status(200).json({ message: "Food item updated successfully", data: dishItem })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
}


const deleteDishItem = async (req, res, next) => {
  try {
    const { id } = req.params

    const dishItem = await dish.findById(id)

    if (!dishItem) {
      return res.status(404).json({ message: "Food item not found" })
    }

    await dishItem.remove()
    res.status(200).json({ message: "Food item deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
}


const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate("userId", "name email").populate("items.dishId", "name price")

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" })
    }

    res.status(200).json({ orders })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
}


const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body 

    if (!status || !["preparing", "shipped", "delivered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status provided" })
    }

    const order = await Order.findById(id)

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    order.status = status
    await order.save()

    res.status(200).json({ message: "Order status updated successfully", order })
  } catch (error) {
    res.status(500).json({ message: "Server error", error })
  }
};

module.exports = {
  createOwner,
  ownerLogout,
  ownerLogin,
  ownerProfile,
  ownerUpdate,
  deleteOwner,
  addDishItem,
  updateDishItem,
  deleteDishItem,
  getAllOrders,
  updateOrderStatus,
}
