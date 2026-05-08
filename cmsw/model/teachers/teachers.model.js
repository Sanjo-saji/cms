import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    employee_id: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    dob: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordUpdate: {
      type: Boolean,
      default: false,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    image: {
      type: String,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "departments",
      required: function () {
        return this.role !== "Principal";
      },
      default: null,
    },
    departmentHead: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["Teacher", "HOD", "Principal", "Librarian"],
      default: "Teacher",
      required: true,
    },

    classInCharge: {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses",
        default: null,
      },
      semester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "semesters",
        default: null,
      },
    },
  },
  { timestamps: true }
);

const Teacher = mongoose.model("teachers", teacherSchema);

export default Teacher;
