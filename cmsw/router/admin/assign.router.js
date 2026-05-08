import express from "express";
import { isAuthenticated } from "../../middileware/auth.middle.js";
import {
  addAssignment,
  deleteAssignment,
  getAllAssignments,
  getAssignedTeachersByCourse,
  getCoursesByDepartment,
  getSubjectsByCourseAndSemester,
  updateAssignment,
} from "../../controller/admin/assign.controller.js";

const assignRouter = express.Router();

// Create assignment
assignRouter.post("/", isAuthenticated, addAssignment);

// Get all assignments
assignRouter.get("/", isAuthenticated, getAllAssignments);

// Update an assignment
assignRouter.put("/:teacherId", isAuthenticated, updateAssignment);

//  Delete an assignment
assignRouter.delete("/:teacherId", isAuthenticated, deleteAssignment);

assignRouter.get(
  "/department/:departmentId",
  isAuthenticated,
  getCoursesByDepartment
);

// Get subjects by course and semester (for assignment)
assignRouter.get(
  "/subjects/:courseId/:semesterId",
  isAuthenticated,
  getSubjectsByCourseAndSemester
);

// Get teachers assigned to a specific course and semester
assignRouter.get(
  "/assigned-teacher",
  isAuthenticated,
  getAssignedTeachersByCourse
);

export default assignRouter;
