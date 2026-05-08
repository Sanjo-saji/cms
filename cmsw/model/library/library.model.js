import mongoose from "mongoose";

const librarySchema = new mongoose.Schema(
  {
    ISBN: {
      required: true,
      type: String,
    },
    count: {
      required: true,
      type: Number,
    },
  },
  { timestamps: true }
);

const Library = mongoose.model("library", librarySchema);
export default Library;
