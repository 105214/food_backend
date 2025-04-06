const mongoose=require('mongoose')
const adminSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
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
        type:String
    },
   mobile:{
        type:String,
        required:true,
        match: [/^\d{10,15}$/, "Please provide a valid phone number"],
    },
    role:{
        type:String,
        enum:["admin","user"],
        default:"admin"
    },
    isActive:{
        type:Boolean,
        default:true,
    },
   
},{timestamps:true})
const Admin=mongoose.model("Admin",adminSchema)
module.exports=Admin 
