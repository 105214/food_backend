const jwt = require("jsonwebtoken");

const userAuth = (req, res, next) => {
  try {
    let token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "User not authenticated", success: false });
    }

    console.log("Token received:", token);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = { id: decoded.id, role: decoded.role }; 
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token", success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: "Authorization failed", success: false, error: error.message });
  }
};

module.exports = userAuth;


























// const jwt = require("jsonwebtoken");

// const userAuth = (req, res, next) => {
//   try {
//     let token;
    
//     // Check for token in cookies or Authorization header
//     if (req.cookies && req.cookies.token) {
//       token = req.cookies.token;
//     } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//       token = req.headers.authorization.split(" ")[1]; // Extract token from "Bearer <token>"
//     } else {
//       return res.status(401).json({ message: "User not authenticated", success: false });
//     }

//     console.log(token, "token received");
//     function generateToken(userId) {
//       return jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });
//     }
//     try {
//       // Verify token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//       req.user = decoded; // Attach user info to req
//       next(); // Proceed to next middleware
//     } catch (err) {
//       return res.status(401).json({ message: "Invalid or expired token", success: false });
//     }
//   } catch (error) {
//     return res.status(500).json({ message: "Authorization failed", success: false, error: error.message });
//   }
// };

// module.exports = userAuth;


 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 // const jwt=require('jsonwebtoken')

// const userAuth=(req,res,next)=>{
//     try{
      
//         const {token}=req.cookies
     
//         if(!token){
//             return res.status(401).json({message:"user not authorized",success:false})
//         }
//         const tokenVerified=jwt.verify(token,process.env.JWT_SECRET_KEY)

//         if(!tokenVerified){
//             return res.status(401).json({message:"user not authorized",success:false})
//         }
//         req.user=tokenVerified
//         next()
//     }catch(error){
//         return res.status(401).json({message:error.message||"user autherization failed",success:false})
//     }
// }
// module.exports=userAuth
