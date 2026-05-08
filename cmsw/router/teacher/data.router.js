import { Router } from "express";
import {
  addEvent,
  getAssign,
  getEvents,
  getEventsByTeacher,
  updateEvent,
  deleteEvent,
  getMonthlyAttendance,
  getStudentAttendanceReport,
  getSchedule,
  getStudentNamesAsc,
  submitAttendance,
  getmessage,
  getmessage_t,
  addMessage_t,
  updateMessage,
  deleteMessage,
  getPeriod,
  getTeachersByCourseAndSemester,
  getProfile,
  getMyScheduledSubjects,
} from "../../controller/teacherController/data.controller.js";
import { isAuthenticated } from "../../middileware/auth.middle.js";
import { upload, convertToJpeg } from "../../middileware/upload.middleware.js";
import { extractCourseAndSemster } from "../../middileware/select.middleware.js";
import {
  checkAssignment,
  getTeacherSubjectNotes,
} from "../../controller/notes/notes.controller.js";
const teacherDataRouter = Router();
teacherDataRouter.get("/assign", isAuthenticated, getAssign);

teacherDataRouter.get(
  "/events-t",
  isAuthenticated,
  extractCourseAndSemster,
  getEvents
);

teacherDataRouter.get(
  "/events-by-teacher",
  isAuthenticated,
  extractCourseAndSemster,
  getEventsByTeacher
);

teacherDataRouter.post(
  "/add-event",
  isAuthenticated,
  upload.single("image"),
  convertToJpeg,
  extractCourseAndSemster,
  addEvent
);

teacherDataRouter.put(
  "/update-event/:id",
  isAuthenticated,
  upload.single("image"),
  extractCourseAndSemster,
  convertToJpeg,
  updateEvent
);

teacherDataRouter.delete("/delete-event/:id", isAuthenticated, deleteEvent);

teacherDataRouter.get(
  "/monthly-attendance",
  isAuthenticated,
  extractCourseAndSemster,
  getMonthlyAttendance
);

teacherDataRouter.get(
  "/student-attendance-report",
  isAuthenticated,
  extractCourseAndSemster,
  getStudentAttendanceReport
);
teacherDataRouter.get("/schedule", isAuthenticated, getSchedule);

teacherDataRouter.get(
  "/student-names",
  isAuthenticated,
  extractCourseAndSemster,
  getStudentNamesAsc
);
teacherDataRouter.post(
  "/submit-attendance",
  isAuthenticated,
  extractCourseAndSemster,
  submitAttendance
);

teacherDataRouter.get(
  "/messages-g",
  isAuthenticated,
  extractCourseAndSemster,
  getmessage
);

teacherDataRouter.post(
  "/add-message-t",
  isAuthenticated,
  extractCourseAndSemster,
  addMessage_t
);

teacherDataRouter.get(
  "/messages-t",
  isAuthenticated,
  extractCourseAndSemster,
  getmessage_t
);

teacherDataRouter.put("/update-message/:id", isAuthenticated, updateMessage);
teacherDataRouter.delete("/delete-message/:id", isAuthenticated, deleteMessage);

teacherDataRouter.get(
  "/get-period",
  isAuthenticated,
  extractCourseAndSemster,
  getPeriod
);

teacherDataRouter.get(
  "/teachers-by-course-semester",
  isAuthenticated,
  getTeachersByCourseAndSemester
);

teacherDataRouter.post(
  "/check-assignment",
  isAuthenticated,
  extractCourseAndSemster,
  checkAssignment
);

teacherDataRouter.get(
  "/get-t-notes",
  isAuthenticated,
  extractCourseAndSemster,
  getTeacherSubjectNotes
);

teacherDataRouter.get("/get-profile", isAuthenticated, getProfile);

teacherDataRouter.get(
  "/get-mark-subject",
  isAuthenticated,
  getMyScheduledSubjects
);

export default teacherDataRouter;
