import express from "express";
import {
  getStudents,
  addStudent,
  addTeacher,
  createDepartment,
  deleteDepartment,
  deleteStudent,
  deleteTeacher,
  updateDepartment,
  updateStudent,
  updateTeacher,
  getDepartments,
  getTeachers,
} from "../../controller/admin/admin.controller.js";
import StudentUpload from "../../middileware/studentUpload.middleware.js";
import uploadTeacher from "../../middileware/uploadTeacher.middleware.js";
import { isAuthenticated } from "../../middileware/auth.middle.js";
const adminRouter = express.Router();

// Route a student
adminRouter.get("/get-students", isAuthenticated, getStudents);

adminRouter.post(
  "/add-student",
  isAuthenticated,
  StudentUpload.single("image"),
  addStudent
);
adminRouter.put(
  "/update-student/:id",
  isAuthenticated,
  StudentUpload.single("image"),
  updateStudent
);
adminRouter.delete("/delete-student/:id", isAuthenticated, deleteStudent);

// Route a teacher
adminRouter.get("/get-teachers", isAuthenticated, getTeachers);

adminRouter.post(
  "/add-teacher",
  isAuthenticated,
  uploadTeacher.single("image"),
  addTeacher
);
adminRouter.put(
  "/update-teacher/:id",
  isAuthenticated,
  uploadTeacher.single("image"),
  updateTeacher
);
adminRouter.delete("/delete-teacher/:id", isAuthenticated, deleteTeacher);

// department routes
adminRouter.get("/get-departments", isAuthenticated, getDepartments);
adminRouter.post("/add-department", isAuthenticated, createDepartment);
adminRouter.put("/update-department/:id", isAuthenticated, updateDepartment);
adminRouter.delete("/delete-department/:id", isAuthenticated, deleteDepartment);

export default adminRouter;
