import mongoose from "mongoose";

const subjectsSchema = new mongoose.Schema(
  {
    name: String,
    course: { type: mongoose.Schema.Types.ObjectId, ref: "courses" },
    image: String,
    semester: { type: mongoose.Schema.Types.ObjectId, ref: "semesters" },
  },
  { timestamps: true }
);

const Subject = mongoose.model("subjects", subjectsSchema);

export default Subject;
