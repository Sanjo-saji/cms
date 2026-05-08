import express from "express";
import {
  RegisterLibrary,
  LogoutLibrary,
  UpdatePassword,
} from "../../controller/library/auth.controller.js";
import { isAuthenticated } from "../../middileware/auth.middle.js";
const libraryAuthrouter = express.Router();

libraryAuthrouter.post("/login-library", RegisterLibrary);
libraryAuthrouter.post("/logout-library", LogoutLibrary);
libraryAuthrouter.post("/update-password-library", isAuthenticated, UpdatePassword);

export default libraryAuthrouter;
