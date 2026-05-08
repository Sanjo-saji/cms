import express from "express";
import { isAuthenticated } from "../../middileware/auth.middle.js";
import {
  addSchedule,
  deleteSchedule,
  getAllSchedules,
  updateSchedule,
} from "../../controller/admin/schedule.controller.js";

const scheduleRouter = express.Router();

//  Create schedule entry
scheduleRouter.post("/", isAuthenticated, addSchedule);

//  Get all schedules
scheduleRouter.get("/", isAuthenticated, getAllSchedules);

//  Update schedule for a teacher
scheduleRouter.put("/:teacherId", isAuthenticated, updateSchedule);

//  Delete schedule for a teacher
scheduleRouter.delete("/:teacherId", isAuthenticated, deleteSchedule);

export default scheduleRouter;
