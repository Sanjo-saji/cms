import mongoose from "mongoose";

const semesterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: true,
    },
  },
  { timestamps: true }
);

// prevent OverwriteModelError
const Semester =
  mongoose.models.semesters || mongoose.model("semesters", semesterSchema);

export default Semester;
