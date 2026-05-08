import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectdb from "../cmsw/config/connectiondb.js";
import studentAuthrouter from "./router/student/auth.router.js";
import studentDataRouter from "./router/student/data.router.js";
import teacherAuthRouter from "./router/teacher/auth.router.js";
import teacherDataRouter from "./router/teacher/data.router.js";
import notesRouter from "./router/notes/notes.router.js";
import evalrouter from "./router/evaluation/evaluation.router.js";
import chatRouter from "./router/chat/chat.router.js";
import libraryAuthrouter from "./router/library/auth.route.js";
import libraryDataRouter from "./router/library/data.route.js";
import adminRouter from "./router/admin/admin.router.js";
import classRouter from "./router/admin/class.router.js";
import anonymousRouter from "./router/anonymous/anonymous.router.js";
import adminAuthRouter from "./router/admin/auth.router.js";
import adminSubjectRouter from "./router/admin/subject.router.js";
import assignRouter from "./router/admin/assign.router.js";
import scheduleRouter from "./router/admin/schedule.router.js";
import timerouter from "./router/admin/timetable.router.js";

const app = express();
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/images", express.static("public/images"));
// Serve teacher images
app.use(
  "/uploads/teachers",
  express.static(path.join(process.cwd(), "cms-teacher"))
);

// Serve student images
app.use(
  "/uploads/students",
  express.static(path.join(process.cwd(), "cms-student"))
);

app.use("/uploads/icons", express.static(path.join(process.cwd(), "cms-icon")));

app.use(cookieParser());
const port = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.send("CMSX");
});
app.use("/api/auth", studentAuthrouter);
app.use("/api/data", studentDataRouter);
app.use("/api/auth", teacherAuthRouter);
app.use("/api/data", teacherDataRouter);
app.use("/api/notes", notesRouter);
app.use("/api/data", evalrouter);
app.use("/api/chat", chatRouter);
app.use("/api/library/auth", libraryAuthrouter);
app.use("/api/library/data", libraryDataRouter);
app.use("/api/anonymous", anonymousRouter);
app.use("/api/admin/auth", adminAuthRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin/class", classRouter);
app.use("/api/admin", adminSubjectRouter);
app.use("/api/admin/assignment", assignRouter);
app.use("/api/admin/schedule", scheduleRouter);
app.use("/api/admin/timetables", timerouter);

const HOST = "0.0.0.0"; // Add this line

app.listen(port, HOST, () => {
  connectdb();
  console.log("Server is running on port", port, HOST);
});
