import mongoose from "mongoose";

const markSubjectSchema = new mongoose.Schema({
  examName: {
    type: String,
    required: true,
  },
  date: String,
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subjects",
    required: true,
  },
  marks: Number,
  total: Number,
});

const semesterMarksSchema = new mongoose.Schema({
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "semesters",
    required: true,
  },
  marks: [markSubjectSchema],
});

const marksSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "students",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: true,
    },
    slortes: [semesterMarksSchema],
  },
  { timestamps: true }
);

const Marks = mongoose.model("marks", marksSchema);

export default Marks;
