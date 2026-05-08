import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    register: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
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
    phone: { type: String },
    admission: { type: String, required: true, unique: true },
    dob: { type: String, required: true },

    passwordUpdate: {
      type: Boolean,
      default: false,
    },
    image: { type: String },
  },
  { timestamps: true }
);

const Student = mongoose.model("students", studentSchema);

export default Student;
