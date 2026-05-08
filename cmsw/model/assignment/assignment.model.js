import mongoose from "mongoose";
const { Schema } = mongoose;

const assignmentSchema = new Schema(
  {
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "teachers",
      required: true,
    },
    assign: [
      {
        course: {
          type: Schema.Types.ObjectId,
          ref: "courses",
          required: true,
        },
        semester: {
          type: Schema.Types.ObjectId,
          ref: "semesters",
          required: true,
        },
        subject: {
          type: Schema.Types.ObjectId,
          ref: "subjects",
          required: true,
        },
      },
    ],
    department: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model("assignments", assignmentSchema);
