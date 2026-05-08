import express from "express";
import { isAuthenticated } from "../../middileware/auth.middle.js";
import {
  uploadNotePDF,
  upload,
  deleteNotePDF,
} from "../../controller/notes/notes.controller.js";
const notesRouter = express.Router();

notesRouter.post(
  "/upload-note",
  isAuthenticated,
  upload.single("pdf"),
  uploadNotePDF
);

notesRouter.delete(
  "/del-notes/:courseId/:semesterId/:subjectId/:pdfName",
  isAuthenticated,
  deleteNotePDF
);

export default notesRouter;
