const dotenv=require("dotenv")
dotenv.config("./.env")
const cloudinary=require("cloudinary").v2

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET, // Click 'View Credentials' below to copy your API secret
});

// console.log(process.env.CLOUD_NAME)
// console.log(process.env.CLOUD_API_KEY)
// console.log(process.env.CLOUD_API_SECRET)

const cloudinaryInstance = cloudinary
module.exports={cloudinaryInstance}












