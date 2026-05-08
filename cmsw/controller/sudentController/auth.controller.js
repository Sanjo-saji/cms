import Student from "../../model/student/student.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

export const RegisterStudent = async (req, res) => {
  const { register, password } = req.body;

  if (!register || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    const user = await Student.findOne({ register });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let isMatch = false;

    // Check default DOB password if password not updated
    if (!user.passwordUpdate) {
      const normalizedDOB = password.replace(/[^0-9]/g, "");
      isMatch = await bcrypt.compare(normalizedDOB, user.password);
    } else {
      // Compare hashed password
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    // ✅ Create token
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("Student login successful, session set");
    return res
      .status(200)
      .json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("RegisterStudent error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const LogoutStudent = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ success: true, message: "Logged out" });
  } catch (error) {
    res.status(500).json({ success: true, message: "Logged out" });
  }
};

export const UpdatePassword = async (req, res) => {
  try {
    const { password, newPassword, confirmPass } = req.body;

    const studentId = req.user.id;

    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    let isMatch = false;

    // If password not updated yet, compare with DOB (numbers only)
    if (!student.passwordUpdate) {
      const normalizedDOB = password.replace(/[^0-9]/g, "");
      isMatch = await bcrypt.compare(normalizedDOB, student.password);
    } else {
      // Compare with hashed password
      isMatch = await bcrypt.compare(password, student.password);
    }

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect current password" });
    }

    if (newPassword !== confirmPass) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    student.password = hashedPassword;
    student.passwordUpdate = true;

    await student.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("UpdatePassword error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
