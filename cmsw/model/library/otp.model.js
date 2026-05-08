import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "students",
      required: true,
      unique: true,
    },
    otp: {
      type: String,
      required: true,
    },
    otpExpires: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    books: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "library",
        },
      },
    ],
  },
  { timestamps: true }
);

const StudentOtp = mongoose.model("student_otps", otpSchema);
export default StudentOtp;
