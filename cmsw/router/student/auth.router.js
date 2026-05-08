import express from "express";
import {
  RegisterStudent,
  LogoutStudent,
  UpdatePassword,
} from "../../controller/sudentController/auth.controller.js";
import { isAuthenticated } from "../../middileware/auth.middle.js";
const studentAuthrouter = express.Router();

studentAuthrouter.post("/login", RegisterStudent);
studentAuthrouter.post("/logout", LogoutStudent);
studentAuthrouter.post("/update-password", isAuthenticated, UpdatePassword);

export default studentAuthrouter;
