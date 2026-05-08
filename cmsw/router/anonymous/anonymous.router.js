import { Router } from "express";
import {
  getStudentAnonIds,
  regenerateAnonId,
  getAnonIdHistory,
  deactivateAnonId,
  resetAllAnonIds
} from "../../controller/anonymous/anonymous.controller.js";
import { isAuthenticated } from "../../middileware/auth.middle.js";

const anonymousRouter = Router();

// Student routes
anonymousRouter.get("/student/ids", isAuthenticated, getStudentAnonIds);
anonymousRouter.post("/student/regenerate", isAuthenticated, regenerateAnonId);
anonymousRouter.get("/student/history", isAuthenticated, getAnonIdHistory);
anonymousRouter.post("/student/reset-all", isAuthenticated, resetAllAnonIds);

// Teacher routes (limited access)
anonymousRouter.post("/teacher/deactivate/:anonId", isAuthenticated, deactivateAnonId);

export default anonymousRouter;
