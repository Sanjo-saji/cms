import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  bookId: {
    required: [true, "Book ID is required"],
    type: mongoose.Schema.Types.ObjectId,
    ref: "library",
  },
  status: {
    type: String,
    enum: ["pending", "approved"],
    default: "pending",
  },
  statusUpdatedAt: { type: Date, default: Date.now },
});

const checkoutSchema = new mongoose.Schema(
  {
    studentId: {
      required: [true, "Student ID is required"],
      type: mongoose.Schema.Types.ObjectId,
      ref: "students",
      index: true,
    },
    Books: [bookSchema],
    checkoutDate: {
      type: Date,
      default: Date.now,
    },
    duedate: {
      type: Date,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Checkout = mongoose.model("checkout", checkoutSchema);
export default Checkout;
