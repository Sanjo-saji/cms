import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: true
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "semesters",
      required: true
    }
  },
  { timestamps: true }
);

// Add index for better query performance
classSchema.index({ course: 1, semester: 1 });
classSchema.index({ name: 1 });

// Prevent OverwriteModelError
const Class = mongoose.models.classes || mongoose.model("classes", classSchema);

export default Class;
