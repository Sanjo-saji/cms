import mongoose from "mongoose";

const AttendanceEntrySchema = new mongoose.Schema({
  period: {
    type: Number,
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "teachers",
    required: true,
  },
  time: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});
const AttendanceSlotSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  submit: [AttendanceEntrySchema],
});
const AttendanceTimeSchema = new mongoose.Schema({
  slote: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses",
        required: true,
      },
      semster: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "semsters",
        required: true,
      },
      attendance: [AttendanceSlotSchema],
    },
  ],
});

export default mongoose.model("attendanceTimes", AttendanceTimeSchema);
