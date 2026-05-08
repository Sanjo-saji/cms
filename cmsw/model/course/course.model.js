import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    courseName: {
      type: String,
      required: true,
      trim: true
    },
    durationYears: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    }
  },
  { timestamps: true }
);

const Course = mongoose.model("courses", courseSchema);
export default Course;
