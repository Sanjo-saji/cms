//evaluation.router.js
import express from "express";
import {studentlists, insertBulkMarks, viewMarks} from "../../controller/evaluation/evaluation.controller.js";
import { isAuthenticated } from "../../middileware/auth.middle.js";
import { extractCourseAndSemster } from "../../middileware/select.middleware.js";

const evalRouter = express.Router();

evalRouter.get("/studentlists", isAuthenticated, extractCourseAndSemster, studentlists);

/*insert-marks function is not currently used as bulk-insert func is used, but it is kept for future reference import insert-marks function 
if needed from evaluation.controller.js if needed in future*/

// evalRouter.post("/insert-marks", isAuthenticated, extractCourseAndSemster,insertMarks);
evalRouter.post("/insert-bulk-marks", isAuthenticated, extractCourseAndSemster, insertBulkMarks);
evalRouter.get("/view-marks/:studentId", isAuthenticated, viewMarks);

export default evalRouter;
