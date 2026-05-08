import express from "express";
import { isAuthenticated } from "../../middileware/auth.middle.js";
import {
  getEvents,
  getAttendancePercentage,
  getSubjectWiseAttendance,
  getAttendanceByDate,
  getNotifications,
  getProfile,
  getMarks,
  getStudentOtp,
  getStudentCheckout,
} from "../../controller/sudentController/data.controller.js";
import {
  downloadNotePDF,
  getStudentNotes,
} from "../../controller/notes/notes.controller.js";
const studentDataRouter = express.Router();

studentDataRouter.get("/events", isAuthenticated, getEvents);
studentDataRouter.get("/attendance", isAuthenticated, getAttendancePercentage);
studentDataRouter.get(
  "/subject-wise-attendance",
  isAuthenticated,
  getSubjectWiseAttendance
);
studentDataRouter.get("/by-date", isAuthenticated, getAttendanceByDate);
studentDataRouter.get("/notifications", isAuthenticated, getNotifications);
studentDataRouter.get("/profile", isAuthenticated, getProfile);
studentDataRouter.get("/marks", isAuthenticated, getMarks);
studentDataRouter.get("/notes", isAuthenticated, getStudentNotes);
studentDataRouter.get("/notes/:subjectName/:pdfName", downloadNotePDF);
studentDataRouter.get("/otp", isAuthenticated, getStudentOtp);
studentDataRouter.get("/checkout", isAuthenticated, getStudentCheckout);
export default studentDataRouter;
