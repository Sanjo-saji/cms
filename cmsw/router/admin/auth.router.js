import express from "express";
import {
  LogoutAdmin,
  RegisterAdmin,
  UpdateAdminPassword,
  getProfile,
} from "../../controller/admin/auth.controller.js";
import { isAuthenticated } from "../../middileware/auth.middle.js";

const adminAuthRouter = express.Router();

adminAuthRouter.post("/login", RegisterAdmin);
adminAuthRouter.post("/logout", isAuthenticated, LogoutAdmin);
adminAuthRouter.put("/update-password", isAuthenticated, UpdateAdminPassword);
adminAuthRouter.get("/get-profile", isAuthenticated, getProfile);
export default adminAuthRouter;
