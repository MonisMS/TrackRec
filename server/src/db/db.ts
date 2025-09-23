import mongoose from "mongoose";
import "dotenv/config";

const MONGO_URI= process.env.MONGODB_URI || "";
export const connectDB= async (): Promise<void> => {
    try {
       if(!MONGO_URI){
        throw new Error("MONGO_URI is not defined in environment variables");
       } 
        await mongoose.connect(MONGO_URI);
        console.log(`Connected to MongoDB at ${mongoose.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

// Graceful shutdown
export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('MongoDB Disconnected');
};