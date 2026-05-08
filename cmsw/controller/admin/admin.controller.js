import Student from "../../model/student/student.model.js";
import Teacher from "../../model/teachers/teachers.model.js";
import Department from "../../model/assignment/department.model.js";
import Course from "../../model/course/course.model.js";
import Class from "../../model/class/class.model.js";
import AnonymousId from "../../model/anonymous/anonymous.model.js";
import Checkout from "../../model/library/checkout.model.js";
import AttendanceSchema from "../../model/student/attendance.model.js";
import Marks from "../../model/student/marks.model.js";
import Transaction from "../../model/library/transation.model.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
// Get Students
export const getStudents = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) return res.status(401).json({ message: "Unauthorized" });

    const baseUrl = "http://miserably-arriving-adder.ngrok-free.app";

    let students;

    // Principal or Admin => full access
    if (teacher.role === "Principal" || teacher.role === "Admin") {
      students = await Student.find()
        .populate({ path: "course", select: "_id name" }) //  include _id
        .populate({ path: "semester", select: "_id name" }) //  include _id
        .select("-password");
    } else {
      // Build query for HOD / Teacher
      let query = {};

      if (teacher.role === "HOD") {
        const courses = await Course.find({
          department: teacher.department,
        }).select("_id");
        query.course = { $in: courses.map((c) => c._id) };
      } else if (teacher.role === "Teacher") {
        if (!teacher.classInCharge) {
          return res
            .status(403)
            .json({ message: "Teacher has no class assigned" });
        }

        const studentClass = await Class.findById(teacher.classInCharge);
        if (!studentClass)
          return res.status(404).json({ message: "Class not found" });

        query.course = studentClass.course;
        query.semester = studentClass.semester;
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      students = await Student.find(query)
        .populate({ path: "course", select: "_id name" }) //  include _id
        .populate({ path: "semester", select: "_id name" }) //  include _id
        .select("-password");
    }

    // Format students with both IDs and names
    const formattedStudents = students.map((s) => ({
      _id: s._id,
      register: s.register,
      name: s.name,
      course: s.course ? { _id: s.course._id, name: s.course.name } : null,
      semester: s.semester
        ? { _id: s.semester._id, name: s.semester.name }
        : null,
      admission: s.admission,
      phone: s.phone,
      dob: s.dob,
      address: s.address,
      image: s.image ? `${baseUrl}/uploads/students/${s.image}` : null,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return res.status(200).json({ success: true, students: formattedStudents });
  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

//  Add Student
export const addStudent = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) return res.status(401).json({ message: "Unauthorized" });

    const { name, register, dob, phone, address, course, semester, admission } =
      req.body;

    if (!name || !register || !dob || !admission || !course || !semester) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if student already exists
    const exists = await Student.findOne({ register });
    if (exists)
      return res.status(409).json({ message: "Register already exists" });

    // HOD: course must belong to their department
    if (teacher.role === "HOD") {
      const courseObj = await Course.findById(course);
      if (!courseObj)
        return res.status(404).json({ message: "Course not found" });

      if (!courseObj.department.equals(teacher.department)) {
        return res
          .status(403)
          .json({ message: "Access denied: course not in your department" });
      }
    }

    // Teacher: classInCharge must match course + semester
    if (teacher.role === "Teacher") {
      if (!teacher.classInCharge) {
        return res
          .status(403)
          .json({ message: "Teacher has no class assigned" });
      }

      const studentClass = await Class.findById(teacher.classInCharge);
      if (!studentClass)
        return res.status(404).json({ message: "Class not found" });

      if (
        !studentClass.course.equals(course) ||
        !studentClass.semester.equals(semester)
      ) {
        return res
          .status(403)
          .json({ message: "Access denied: student not in your class" });
      }
    }

    // Normalize DOB for password
    const normalizedDOB = dob.replace(/[^0-9]/g, "");
    console.log(normalizedDOB);

    const hashedPassword = await bcrypt.hash(normalizedDOB, 10);

    const student = await Student.create({
      name,
      register,
      dob,
      phone,
      address: {
        street: address?.street,
        city: address?.city,
        state: address?.state,
        pincode: address?.pincode,
      },
      course,
      semester,
      admission,
      password: hashedPassword,
      image: req.file ? req.file.filename : null,
    });

    return res.status(201).json({ success: true, student });
  } catch (error) {
    console.error("Error adding student:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// update Student
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) return res.status(401).json({ message: "Unauthorized" });

    const { name, register, dob, phone, address, course, semester, admission } =
      req.body;
    const student = await Student.findById(id).populate("course semester");
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Role-based access check
    if (teacher.role === "HOD") {
      if (!student.course.department.equals(teacher.department)) {
        return res
          .status(403)
          .json({ message: "Access denied: student not in your department" });
      }
    }

    if (teacher.role === "Teacher") {
      if (!teacher.classInCharge)
        return res
          .status(403)
          .json({ message: "Teacher has no class assigned" });

      const studentClass = await Class.findById(teacher.classInCharge);
      if (!studentClass)
        return res.status(404).json({ message: "Class not found" });

      if (
        !studentClass.course.equals(student.course._id) ||
        !studentClass.semester.equals(student.semester._id)
      ) {
        return res
          .status(403)
          .json({ message: "Access denied: student not in your class" });
      }
    }

    // check duplicate register if changed
    if (register && register !== student.register) {
      const exists = await Student.findOne({ register });
      if (exists)
        return res
          .status(409)
          .json({ message: "Register number already exists" });
      student.register = register;
    }

    // check duplicate admission if changed
    if (admission && admission !== student.admission) {
      const admissionExists = await Student.findOne({ admission });
      if (admissionExists)
        return res
          .status(409)
          .json({ message: "Admission number already exists" });
      student.admission = admission;
    }

    // update fields
    if (name) student.name = name;
    if (phone) student.phone = phone;
    if (course) student.course = course;
    if (semester) student.semester = semester;

    // update dob → only update password if passwordUpdate = false
    if (dob && dob !== student.dob) {
      student.dob = dob;
      if (!student.passwordUpdate) {
        const normalizedDOB = dob.replace(/[^0-9]/g, "");
        student.password = await bcrypt.hash(normalizedDOB, 10);
      }
    }

    // merge address
    if (address) {
      student.address = {
        ...student.address,
        street: address.street ?? student.address.street,
        city: address.city ?? student.address.city,
        state: address.state ?? student.address.state,
        pincode: address.pincode ?? student.address.pincode,
      };
    }

    // update image if new file uploaded
    if (req.file) {
      student.image = req.file.filename;
    }

    await student.save();

    return res.status(200).json({ success: true, student });
  } catch (error) {
    console.error("Error updating student:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

//  Delete Student
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(req.user.id);
    if (!teacher) return res.status(401).json({ message: "Unauthorized" });

    const student = await Student.findById(id).populate("course semester");
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Role-based access
    if (teacher.role === "HOD") {
      if (!student.course.department.equals(teacher.department)) {
        return res
          .status(403)
          .json({ message: "Access denied: student not in your department" });
      }
    }

    if (teacher.role === "Teacher") {
      if (!teacher.classInCharge)
        return res
          .status(403)
          .json({ message: "Teacher has no class assigned" });

      const studentClass = await Class.findById(teacher.classInCharge);
      if (!studentClass)
        return res.status(404).json({ message: "Class not found" });

      if (
        !studentClass.course.equals(student.course._id) ||
        !studentClass.semester.equals(student.semester._id)
      ) {
        return res
          .status(403)
          .json({ message: "Access denied: student not in your class" });
      }
    }

    // remove student image if exists
    if (student.image) {
      const imagePath = path.join("cms-student", student.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    // Cascade delete all related documents
    await Promise.all([
      AnonymousId.deleteMany({ studentId: student._id }),
      Checkout.deleteMany({ studentId: student._id }),
      AttendanceSchema.deleteMany({ studentId: student._id }),
      Marks.deleteMany({ studentId: student._id }),
      Transaction.deleteMany({ studentId: student._id }),
    ]);

    // delete student
    await Student.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Student ${student.register} and related data deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// ================== GET TEACHERS ==================
export const getTeachers = async (req, res) => {
  try {
    const user = await Teacher.findById(req.user.id);
    if (!user || user.role !== "Principal") {
      return res
        .status(403)
        .json({ message: "Access denied: only Principal can view teachers" });
    }

    const baseUrl = "http://miserably-arriving-adder.ngrok-free.app";

    const teachers = await Teacher.find()
      .populate("department", "name")
      .populate("classInCharge.course", "name")
      .populate("classInCharge.semester", "name")
      .select("-password");

    const formattedTeachers = teachers.map((t) => ({
      _id: t._id,
      name: t.name,
      employee_id: t.employee_id,
      role: t.role,
      department: t.department?.name || null,
      classInCharge: t.classInCharge?.course
        ? {
            course: t.classInCharge.course?.name || null,
            semester: t.classInCharge.semester?.name || null,
          }
        : null,
      phone: t.phone,
      dob: t.dob,
      address: t.address,
      image: t.image ? `${baseUrl}/uploads/teachers/${t.image}` : null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return res.status(200).json({ success: true, teachers: formattedTeachers });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// ================== ADD TEACHER ==================
export const addTeacher = async (req, res) => {
  try {
    const user = await Teacher.findById(req.user.id);
    if (!user || user.role !== "Principal") {
      return res
        .status(403)
        .json({ message: "Access denied: only Principal can add teachers" });
    }

    const {
      name,
      employee_id,
      phone,
      dob,
      address,
      department,
      departmentHead,
      classInCharge,
      role,
    } = req.body;

    if (!name || !employee_id || !dob || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await Teacher.findOne({ employee_id });
    if (exists) {
      return res.status(409).json({ message: "Teacher already exists" });
    }

    const normalizedDOB = dob.replace(/[^0-9]/g, "");
    console.log(normalizedDOB);

    const hashedPassword = await bcrypt.hash(normalizedDOB, 10);

    const teacher = await Teacher.create({
      name,
      employee_id,
      phone,
      department: department || null,
      departmentHead,
      dob,
      password: hashedPassword,
      address,
      image: req.file ? req.file.filename : null,
      role,
      classInCharge: classInCharge
        ? {
            course: classInCharge.course || null,
            semester: classInCharge.semester || null,
          }
        : null,
    });

    return res.status(201).json({ success: true, teacher });
  } catch (error) {
    console.error("Error adding teacher:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// ================== UPDATE TEACHER ==================
export const updateTeacher = async (req, res) => {
  try {
    const user = await Teacher.findById(req.user.id);
    if (!user || user.role !== "Principal") {
      return res
        .status(403)
        .json({ message: "Access denied: only Principal can update teachers" });
    }

    const { id } = req.params;
    const {
      name,
      employee_id,
      phone,
      dob,
      address,
      department,
      departmentHead,
      role,
      classInCharge,
    } = req.body;

    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // check duplicate employee_id
    if (employee_id && employee_id !== teacher.employee_id) {
      const exists = await Teacher.findOne({ employee_id });
      if (exists) {
        return res.status(409).json({ message: "Employee ID already exists" });
      }
      teacher.employee_id = employee_id;
    }

    if (name) teacher.name = name;
    if (phone) teacher.phone = phone;
    if (department) teacher.department = department;
    if (typeof departmentHead === "boolean")
      teacher.departmentHead = departmentHead;
    if (role) teacher.role = role;

    if (classInCharge) {
      teacher.classInCharge = {
        course: classInCharge.course || teacher.classInCharge?.course,
        semester: classInCharge.semester || teacher.classInCharge?.semester,
      };
    }

    if (dob && dob !== teacher.dob) {
      teacher.dob = dob;
      if (!teacher.passwordUpdate) {
        const normalizedDOB = dob.replace(/[^0-9]/g, "");
        teacher.password = await bcrypt.hash(normalizedDOB, 10);
      }
    }

    if (address) {
      teacher.address = {
        ...teacher.address,
        street: address.street ?? teacher.address.street,
        city: address.city ?? teacher.address.city,
        state: address.state ?? teacher.address.state,
        pincode: address.pincode ?? teacher.address.pincode,
      };
    }

    if (req.file) teacher.image = req.file.filename;

    await teacher.save();

    return res.status(200).json({ success: true, teacher });
  } catch (error) {
    console.error("Error updating teacher:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

//  Delete Teacher
export const deleteTeacher = async (req, res) => {
  try {
    const user = await Teacher.findById(req.user.id); // from JWT middleware
    if (!user || user.role !== "Principal") {
      return res.status(403).json({
        success: false,
        message: "Access denied: only Principal can delete teachers",
      });
    }

    const { id } = req.params; // MongoDB _id
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    // remove teacher image if exists
    if (teacher.image) {
      const imagePath = path.join("cms-teacher", teacher.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Teacher.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Teacher ${teacher.employee_id} deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const user = await Teacher.findById(req.user.id);

    if (!user || user.role !== "Principal") {
      return res.status(403).json({
        success: false,
        message: "Access denied: only Principal can view departments",
      });
    }

    // Fetch departments including their courses so clients can show assigned courses
    const departments = await Department.find()
      .populate("courses", "courseName name durationYears")
      .lean();

    return res.status(200).json({ success: true, departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

// Create Department
export const createDepartment = async (req, res) => {
  try {
    const user = await Teacher.findById(req.user.id);
    if (!user || user.role !== "Principal") {
      return res.status(403).json({
        success: false,
        message: "Access denied: only Principal can create departments",
      });
    }

    const { name, courses } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Department name is required" });
    }

    const exists = await Department.findOne({ name });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Department already exists" });
    }

    //  Validate courses array if provided
    if (courses && courses.length > 0) {
      const validCourses = await Course.find({ _id: { $in: courses } }).select(
        "_id"
      );
      if (validCourses.length !== courses.length) {
        return res.status(400).json({
          success: false,
          message: "One or more course IDs are invalid",
        });
      }
    }

    const department = await Department.create({
      name,
      courses: courses || [],
    });

    return res.status(201).json({ success: true, department });
  } catch (error) {
    console.error("Error creating department:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

// Update Department
export const updateDepartment = async (req, res) => {
  try {
    const user = await Teacher.findById(req.user.id);
    if (!user || user.role !== "Principal") {
      return res.status(403).json({
        success: false,
        message: "Access denied: only Principal can update departments",
      });
    }

    const { id } = req.params;
    const { name, courses } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    if (name) department.name = name;

    //  Validate courses before updating
    if (courses && courses.length > 0) {
      const validCourses = await Course.find({ _id: { $in: courses } }).select(
        "_id"
      );
      if (validCourses.length !== courses.length) {
        return res.status(400).json({
          success: false,
          message: "One or more course IDs are invalid",
        });
      }
      department.courses = courses;
    }

    await department.save();

    return res.status(200).json({ success: true, department });
  } catch (error) {
    console.error("Error updating department:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

// Delete Department
export const deleteDepartment = async (req, res) => {
  try {
    const user = await Teacher.findById(req.user.id);
    if (!user || user.role !== "Principal") {
      return res.status(403).json({
        success: false,
        message: "Access denied: only Principal can delete departments",
      });
    }

    const { id } = req.params;
    const department = await Department.findById(id);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    // Set department = null for all teachers in this department
    await Teacher.updateMany(
      { department: id },
      { $set: { department: null } }
    );

    await Department.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};
