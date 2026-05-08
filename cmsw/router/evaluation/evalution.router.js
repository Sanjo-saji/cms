//evaluation.router.js
import express from "express";
import { studentlists } from "../../controller/evaluation/evaluation.controller.js";
import { isAuthenticated } from "../../middileware/auth.middle.js";
import { extractCourseAndSemster } from "../../middileware/select.middleware.js";

const evalRouter = express.Router();

evalRouter.get(
  "/studentlists",
  isAuthenticated,
  extractCourseAndSemster,
  studentlists,
);
export default evalRouter;
