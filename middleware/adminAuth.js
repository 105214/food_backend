const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token
  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.admin = decoded; // Change req.user to req.admin
    next();
  });
};

module.exports = adminAuth;













// const jwt = require('jsonwebtoken');

// const adminAuth = (req, res, next) => {
//     console.log("admin authentication",req.headers.authorization)
//     try {
//         let token = req.cookies.token;  // First, check cookies
//         console.log("backend toke",token)
//         // If not found in cookies, check Authorization header
//         if (!token && req.headers.authorization) {
//             token = req.headers.authorization.split(" ")[1]; // "Bearer <token>"
//         }

      

//         if (!token) {
//             return res.status(401).json({ message: "admin not authorized", success: false });
//         }

//         const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);

//         if (!tokenVerified) {
//             return res.status(401).json({ message: "admin not authorized", success: false });
//         }

//         req.admin = tokenVerified;
//         next();
//     } catch (error) {
//         return res.status(401).json({ message: error.message || "User authorization failed", success: false });
//     }
// };

// module.exports = adminAuth;






// const jwt =require("jsonwebtoken");

//  const adminAuth = (req, res, next) => {
//     try {
//       const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
//         // const { token } = req.cookies;
//         console.log("backenddd tokken",token);
        

//         if (!token) {
//             return res.status(401).json({ message: "admin not autherised", success: false });
//         }

//         const tokenVerified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        
//         if (!tokenVerified) {
//             return res.status(401).json({ message: "admin not autherised", success: false });
//         }
        
//         if(tokenVerified.role !='admin'){
//             return res.status(401).json({ message: "user not autherised", success: false });
//         }

//         req.admin = tokenVerified;

//         next();
//     } catch (error) {
//         return res.status(401).json({ message: error.message || "user autherization failed", success: false });
//     }
// };
// module.exports = adminAuth;











