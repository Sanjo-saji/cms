import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    studentId: {
      required: [true, "Student ID is required"],
      type: mongoose.Schema.Types.ObjectId,
      ref: "students",
      index: true,
    },
    bookId: {
      required: [true, "Book ID is required"],
      type: mongoose.Schema.Types.ObjectId,
      ref: "library",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "deleted"],
      default: "pending",
    },
    checkoutDate: {
      type: mongoose.Schema.Types.Date,
      ref: "checkout",
    },
    dueDate: {
      type: mongoose.Schema.Types.Date,
      ref: "checkout",
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("transaction", transactionSchema);
export default Transaction;
