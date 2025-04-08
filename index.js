
const express=require('express')
const mongoose=require('mongoose')
const cors=require("cors")
const cookieParser = require('cookie-parser');
const dotenv=require("dotenv")
const apiRouter=require('./router/index.js')
dotenv.config("./.env")
const app=express()
const port=3001
const dbpassword=process.env.DB_PASSWORD


mongoose.connect(`mongodb+srv://food_app:foodapp@cluser1.qd3yu.mongodb.net/?retryWrites=true&w=majority&appName=Cluser1`)
.then(res=>{
 console.log("database connected")
})
.catch(err=>{
    console.log("database connection failed")
})
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
// app.use(cors({
//     origin: "http://localhost:5173",
//     methods:["GET","PUT","POST","DELETE","OPTIONS"],
//     credentials:true,
// }))

const allowedOrigins = [
  "http://localhost:5173",
  "https://food-root-website.vercel.app",
  "https://food-root-gcjs.vercel.app",
 "https://food-root-l1iq.vercel.app"
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      // Don't throw an error - instead, return false to disallow the origin
      return callback(null, false);
    }
  },
  credentials: true,
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
}));
  // app.use(cors({
  //   origin: function (origin, callback) {
  //     // Allow requests with no origin (like mobile apps or curl requests)
  //     if (!origin) return callback(null, true);
  //     if (allowedOrigins.includes(origin)) {
  //       return callback(null, true);
  //     } else {
  //       return callback(new Error("Not allowed by CORS"));
  //     }
  //   },
  //   credentials: true,
  //   methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  // }));
  
app.use(cookieParser());
app.get("/",(req,res)=>{
res.send("backend hosted")
})
app.use('/api',apiRouter)



app.listen(port,()=>{
    console.log("port running")
})