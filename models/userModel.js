const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    name:{
      type: String,
      required:true,
    },
    email:{
        type:String,
        unique:true,
        required:true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    password:{
        type:String,
        required:true,
        minlength:8,
    },
 profilePic:{
        type:String,
       
         default:"https://www.shutterstock.com/image-vector/avatar-gender-neutral-silhouette-vector-600nw-2470054311.jpg",
    },
    mobile:{
        type:String,
        required:true,
        match: [/^\d{10,15}$/, "Please provide a valid phone number"],
    },
    address:{
          type:String,
          required:true,
          
    },
   role: {
    type:String,
    enum: ['user', 'admin'],
    default: 'user'

    },
    isActive:{
        type:Boolean,
        default:true,
    },
},{timestamps:true})
const User=mongoose.model("User",userSchema)
module.exports=User