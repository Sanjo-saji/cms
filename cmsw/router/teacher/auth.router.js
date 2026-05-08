import express from "express";
import {
  RegisterTeacher,
  UpdatePassword,
  LogoutTeacher,
} from "../../controller/teacherController/auth.controller.js";
import { isAuthenticated } from "../../middileware/auth.middle.js";

const teacherAuthRouter = express.Router();

teacherAuthRouter.post("/login-t", RegisterTeacher);
teacherAuthRouter.post("/update-password-t", isAuthenticated, UpdatePassword);
teacherAuthRouter.post("/logout-t", isAuthenticated, LogoutTeacher);

export default teacherAuthRouter;
