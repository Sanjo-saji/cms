import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectdb = () => {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("MongoDB connection successful");
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
    });
};

export default connectdb;
