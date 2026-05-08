import mongoose from "mongoose";
const eventSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    image: String,
    semster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "semesters",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courses",
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "teachers",
    },
    date: String,
    deleteOnDate: String,
  },
  { timestamps: true }
);
const Event = mongoose.model("events", eventSchema);
export default Event;
