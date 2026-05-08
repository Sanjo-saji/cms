import express from "express";
import {
  addOrUpdateTimeTable,
  deleteTimeTable,
  getAllTimeTables,
  getTeachersByCourseAndSemester,
  getSubjectsByCourseAndSemester,
} from "../../controller/admin/timetable.controller.js";
import { isAuthenticated } from "../../middileware/auth.middle.js";

const timerouter = express.Router();

//  Add timetable or update
timerouter.post("/", isAuthenticated, addOrUpdateTimeTable);

//  Get all timetables
timerouter.get("/", isAuthenticated, getAllTimeTables);

//  Delete timetable by ID
timerouter.delete("/:id", isAuthenticated, deleteTimeTable);

timerouter.get(
  "/teacher/:courseId/:semesterId",
  isAuthenticated,
  getTeachersByCourseAndSemester
);

timerouter.get(
  "/subject/:courseId/:semesterId",
  isAuthenticated,
  getSubjectsByCourseAndSemester
);

export default timerouter;
