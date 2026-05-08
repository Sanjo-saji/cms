import mongoose from "mongoose";

const PeriodSchema = new mongoose.Schema({
  period_id: {
    type: Number,
    unique: true, // ensures uniqueness at DB level
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subjects",
    required: true,
  },
  start: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  end: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
});

const DaySchema = new mongoose.Schema({
  day: {
    type: String,
   enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    required: true,
  },
  time: [PeriodSchema],
});

const TimeTableSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
      required: true,
    },
    semster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "semesters",
      required: true,
    },
    days: [DaySchema],
  },
  { timestamps: true }
);

//  Pre-save hook to auto-generate unique period_id
TimeTableSchema.pre("save", async function (next) {
  for (let day of this.days) {
    for (let period of day.time) {
      if (!period.period_id) {
        period.period_id = await generateUniquePeriodId(this.constructor);
      }
    }
  }
  next();
});

export default mongoose.model("timetables", TimeTableSchema);
