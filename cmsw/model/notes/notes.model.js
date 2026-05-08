import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const noteSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subjects",
    required: true,
  },
  pdfs: [pdfSchema],
});

const semesterCourseSchema = new mongoose.Schema(
  {
    courseid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: true,
    },
    semsterid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "semesters",
      required: true,
    },
    notes: [noteSchema],
  },
  { timestamps: true }
);
// Add compound index for efficient querying
semesterCourseSchema.index({ courseid: 1, semsterid: 1 }, { unique: true });

const NotesSchema = mongoose.model("notes", semesterCourseSchema);
export default NotesSchema;
