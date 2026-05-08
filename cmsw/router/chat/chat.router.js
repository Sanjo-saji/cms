import { Router } from "express";
import {
  sendStudentMessage,
  sendTeacherMessage,
  getTeacherChats,
  getStudentChat,
  getTeacherStudentChat,
  // debugChatStructure,
  // debugChatRaw,
  // regenerateAnonIdGlobal,
} from "../../controller/chat/chat.controller.js";
import { isAuthenticated } from "../../middileware/auth.middle.js";

const chatRouter = Router();

// Student routes
chatRouter.post("/student/send", isAuthenticated, sendStudentMessage);
chatRouter.get("/student/chat/:teacherId", isAuthenticated, getStudentChat);
// chatRouter.get(
//   "/student/regenerate-anonid-global",
//   isAuthenticated,
//   regenerateAnonIdGlobal
// );

// Teacher routes
chatRouter.post("/teacher/send", isAuthenticated, sendTeacherMessage);
chatRouter.get("/teacher/chats", isAuthenticated, getTeacherChats);
chatRouter.get("/teacher/chat/:anonId", isAuthenticated, getTeacherStudentChat);

// Debug routes
// chatRouter.get("/debug", isAuthenticated, debugChatStructure);
// chatRouter.get("/debug-raw", isAuthenticated, debugChatRaw);

export default chatRouter;
