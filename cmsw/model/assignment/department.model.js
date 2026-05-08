// models/Department.js
import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses",
      },
    ],
  },
  { timestamps: true }
);

const Department = mongoose.model("departments", DepartmentSchema);

export default Department;
