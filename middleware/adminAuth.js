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
    req.user = decoded; // Attach user to request
    next();
  });
};

module.exports = adminAuth;








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











