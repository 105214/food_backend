const multer = require('multer');
const { diskStorage } = multer;


const storage = diskStorage({
    filename: function (req, file, cb) {
        console.log('file===',file);
        
        cb(null, file.originalname);
    },
});

 const upload = multer({ storage: storage });
 module.exports={upload}
 
















// const express=require("express")
// const multer = require("multer");



// // Configure multer storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/') // Make sure this directory exists
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname))
//   }
// });
// const upload = multer({ storage: storage });
// const getFolder = (type) => {
//   console.log("Getting folder for type:", type);
//   switch (type?.toLowerCase()) {
//     case "user":
//       return "user-profile-pics";
//     case "admin":
//       return "admin-profile-pics";
//     case "restaurant":
//       return "restaurant-items";
//     case "delivery":
//       return "delivery-boys";
//     default:
//       return "general";
//   }
// };

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './uploads')
//   },
//   filename: function (req, file, cb) {
   
//     cb(null,Date.now()+"-"+ file.originalname)
//   }
// })

// const upload = multer({ storage })

// module.exports = upload;


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//     //   cb(null, './uploads')
//     cb(null, "uploads/")
//     },
//     filename: function (req, file, cb) {
     
//     //   cb(null,Date.now()+"-"+file.originalname)
//     cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname);    
// }

//   })
  
//   const upload = multer({storage})





// const storage = multer.diskStorage({
//     filename: function (req, file, cb) {
//         console.log('file===', file);
//         cb(null,"uploads/" );
//     },
// });

// const upload = multer({ storage: storage });

// module.exports = upload;

