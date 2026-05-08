import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  deleteCourseAndReferences,
  getSemestersByCourse,
} from "../../controller/admin/course.controller.js";
import { isAuthenticated } from "../../middileware/auth.middle.js";
import {
  createClass,
  getAllClasses,
  getClassById,
  getClassesByCourse,
  getClassesBySemester,
  updateClass,
  deleteClass,
} from "../../controller/admin/class.controller.js";

const classRouter = express.Router();

// Course routes
classRouter.post("/create-course", isAuthenticated, createCourse);
classRouter.get("/courses", isAuthenticated, getAllCourses);
classRouter.get("/course/:id", isAuthenticated, getCourseById);
classRouter.put("/update-course/:id", isAuthenticated, updateCourse);
classRouter.delete("/delete-course/:id", isAuthenticated, deleteCourse);
classRouter.delete(
  "/delete-course-and-references/:id",
  isAuthenticated,
  deleteCourseAndReferences
);
classRouter.get(
  "/courses-by-semester/:courseId",
  isAuthenticated,
  getSemestersByCourse
);

// Class routes
classRouter.post("/create-class", createClass);
classRouter.get("/classes", getAllClasses);
classRouter.get("/class/:id", getClassById);
classRouter.get("/classes/course/:courseId", getClassesByCourse);
classRouter.get("/classes/semester/:semesterId", getClassesBySemester);
classRouter.put("/update-class/:id", updateClass);
classRouter.delete("/delete-class/:id", deleteClass);

export default classRouter;
