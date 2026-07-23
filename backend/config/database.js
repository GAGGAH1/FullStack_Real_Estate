import mongoose from "mongoose";
import dns from "node:dns/promises";

// Use Cloudflare + Google DNS to resolve Atlas hostnames
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const getMongoUri = () => {
  const configuredUri = process.env.MONGODB_URI?.trim();
  if (configuredUri) {
    return configuredUri;
  }
  // Fallback to local MongoDB
  return "mongodb://127.0.0.1:27017/realestate";
};

const connectDB = async () => {
  const mongoUri = getMongoUri();
  const isProduction = process.env.NODE_ENV === "production";

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log("MONGODB CONNECTED SUCCESSFULLY");
    return true;
  } catch (error) {
    console.error("MongoDB CONNECTION FAILED:", error.message);

    if (isProduction) {
      // In production, a DB failure is fatal
      process.exit(1);
    }

    // In development, warn and continue so routes that don't need DB still work
    console.warn(
      "\n⚠️  WARNING: MongoDB is unreachable. Possible fixes:\n" +
      "  1. Whitelist your current IP in MongoDB Atlas:\n" +
      "     https://cloud.mongodb.com/ → Network Access → Add IP Address\n" +
      "  2. Or switch MONGODB_URI in .env to: mongodb://127.0.0.1:27017/realestate\n" +
      "     (requires a local MongoDB installation)\n"
    );
    return false;
  }
};

export default connectDB;