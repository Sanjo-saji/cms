import mongoose from "mongoose";

const messagesSchema = new mongoose.Schema(
  {
    Heading: {
      type: String,
      required: true,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "teachers" },
    date: { type: String },
    content: { type: String },
    semesterId: { type: mongoose.Schema.Types.ObjectId, ref: "semesters" },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "courses" },
  },
  { timestamps: true }
);

const Messages = mongoose.model("Messages", messagesSchema);

export default Messages;
