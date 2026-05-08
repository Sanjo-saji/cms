import mongoose from "mongoose";

const { Schema } = mongoose;

const teacherSchema = new Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teachers",
      required: true,
    },

    assignments: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "courses",
          required: true,
        },
        semester: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "semesters",
          required: true,
        },
      },
    ],

    schedule: [
      {
        day: {
          type: String,
          required: true,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        },
        contents: [
          {
            course: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "courses",
              required: true,
            },
            semester: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "semesters",
              required: true,
            },
            subject: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "subjects",
              required: true,
            },
            time: {
              type: String,
              required: true,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

teacherSchema.index({ teacher: 1 });
teacherSchema.index({ "schedule.day": 1 });

const TeacherAssignmentSchedule = mongoose.model(
  "teacher_assignments_schedules",
  teacherSchema
);

export default TeacherAssignmentSchedule;
