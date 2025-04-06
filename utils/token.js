// const jwt = require('jsonwebtoken');

// const generateToken = (id, role, expiresIn = "1h") => {
//     if (!id) {
//         throw new Error("User ID is required for token generation");
//     }

//     if (!process.env.JWT_SECRET_KEY) {
//         throw new Error("JWT_SECRET_KEY is missing in environment variables");
//     }

//     try {
//         return jwt.sign({ id, role }, process.env.JWT_SECRET_KEY, { expiresIn });
//     } catch (error) {
//         console.error("Token Generation Error:", error.message);
//         throw new Error("Failed to generate authentication token");
//     }
// };

// module.exports = { generateToken };













const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    try {
        if (!process.env.JWT_SECRET_KEY) {
            throw new Error("JWT_SECRET_KEY is missing in environment variables");
        }

        const token = jwt.sign({ id, role }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

        return token;
    } catch (error) {
        console.error("Token Generation Error:", error.message);
        return null; // Return null instead of undefined
    }
};

module.exports = { generateToken };















// const jwt=require('jsonwebtoken')

// const generateToken=(id,role="user")=>{
//     try{
//         var token=jwt.sign({id,role},process.env.JWT_SECRET_KEY)
       
//             return token  
            
//     }catch(error){
//         console.log(error)
//     }
// }
// module.exports={generateToken}