// Local MongoDB Compass COnnection
// import mongoose from "mongoose";

// const getMongoUri = () => {
//   const configuredUri = process.env.MONGODB_URI?.trim();
//   if (configuredUri) {
//     return configuredUri;
//   }

//   return "mongodb://127.0.0.1:27017/realestate";
// };

// const connectDB = async () => {
//   const mongoUri = getMongoUri();

//   try {
//     await mongoose.connect(mongoUri, {
//       serverSelectionTimeoutMS: 5000,
//       connectTimeoutMS: 5000,
//     });

//     console.log("MongoDB connected successfully");
//     return true;
//   } catch (error) {
//     console.error("MongoDB connection error:", error.message);

//     if (process.env.NODE_ENV === "production") {
//       process.exit(1);
//     }

//     console.warn("Continuing without MongoDB connection. Start MongoDB or update MONGODB_URI to enable database features.");
//     return false;
//   }
// };

// export default connectDB;


import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MONGODB CONNECTED SUCCESSFULLY");
    } catch (error) {
        console.error("MongoDB CONNECTION FAILED:", error);
        process.exit(1);
    }
};

export default connectDB;
// This code connects to a MongoDB database using Mongoose.