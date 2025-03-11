const jwt = require('jsonwebtoken');

const ownerAuth = (req, res, next) => {
    console.log("owner authentication",req.headers.authorization)
    try {
        let token = req.cookies.token;  // First, check cookies
        console.log("backend toke",token)
        // If not found in cookies, check Authorization header
        if (!token && req.headers.authorization) {
            token = req.headers.authorization.split(" ")[1]; // "Bearer <token>"
        }

      

        if (!token) {
            return res.status(401).json({ message: "Owner not authorized", success: false });
        }

        const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);

        if (!tokenVerified) {
            return res.status(401).json({ message: "Owner not authorized", success: false });
        }

        req.owner = tokenVerified;
        next();
    } catch (error) {
        return res.status(401).json({ message: error.message || "User authorization failed", success: false });
    }
};

module.exports = ownerAuth;














// const jwt=require('jsonwebtoken')

// const ownerAuth=(req,res,next)=>{
//     try{
//         const {token}=req.cookies
//         console.log("tokkeen",token)
//         if(!token){
//             return res.status(401).json({message:"owner not authorized",success:false})
//         }
//         const tokenVerified=jwt.verify(token,process.env.JWT_SECRET_KEY)

//         if(!tokenVerified){
//             return res.status(401).json({message:"owner not authorized",success:false})
//         }
//         req.owner=tokenVerified
//         next()
//     }catch(error){
//         return res.status(401).json({message:error.message||"user autherization failed",success:false})
//     }
// } 
// module.exports=ownerAuth





















