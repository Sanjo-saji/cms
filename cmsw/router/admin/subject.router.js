import express from "express";
import { isAuthenticated } from "../../middileware/auth.middle.js";
import {
  createSubject,
  deleteSubject,
  getSubjects,
  updateSubject,
} from "../../controller/admin/subject.controller.js";
import uploadSubject from "../../middileware/subjectUpload.middelware.js";

const adminSubjectRouter = express.Router();

adminSubjectRouter.get("/subjects", isAuthenticated, getSubjects);

adminSubjectRouter.post(
  "/create-subject",
  isAuthenticated,
  uploadSubject.single("image"),
  createSubject
);

adminSubjectRouter.put(
  "/update-subject/:id",
  isAuthenticated,
  uploadSubject.single("image"),
  updateSubject
);

adminSubjectRouter.delete(
  "/delete-subject/:id",
  isAuthenticated,
  deleteSubject
);

export default adminSubjectRouter;
