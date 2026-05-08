import mongoose from "mongoose";

const TimeSlotSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subjects",
    required: true,
  },
  status: {
    type: String,
    enum: ["present", "absent"],
    default: "absent",
  },
});

const DailyAttendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  slots: [TimeSlotSchema],
});

const AttendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "students",
      required: true,
      index: true,
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "semesters",
      required: true,
      index: true,
    },
    attendance: [DailyAttendanceSchema],
  },
  {
    timestamps: true,
  }
);

AttendanceSchema.index({ student: 1, semester: 1 }, { unique: true });

export default mongoose.model("Attendance", AttendanceSchema);
