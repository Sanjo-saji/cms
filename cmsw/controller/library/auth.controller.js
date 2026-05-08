import Teacher from "../../model/teachers/teachers.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const RegisterLibrary = async (req, res) => {
  const { employeeId, password } = req.body;

  if (!employeeId || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    const user = await Teacher.findOne({ employee_id: employeeId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let isMatch = false;

    // Principals always use hashed password
    if (user.role !== "Principal" && !user.passwordUpdate) {
      // HOD or Teacher with default DOB password
      const normalizedDOB = password.replace(/[^0-9]/g, "");

      isMatch = await bcrypt.compare(normalizedDOB, user.password);
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    // Only allow Principal, HOD, or Librarian
    const allowedRoles = ["principal", "librarian"];
    if (!allowedRoles.includes(user.role.toLowerCase())) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: unauthorized role" });
    }

    // 🔑 Create token
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("Login successful, session set");
    return res.status(200).json({
      success: true,
      message: "Login successful",
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("RegisterLibrary error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const LogoutLibrary = (req, res) => {
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
    const employeeId = req.user.id;

    const teacher = await Teacher.findById(employeeId);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let isMatch = false;

    // Principals always use hashed password
    if (teacher.role !== "Principal" && !teacher.passwordUpdate) {
      // Compare with normalized DOB
      const normalizedDOB = password.replace(/[^0-9]/g, "");
      isMatch = await bcrypt.compare(normalizedDOB, teacher.password);
    } else {
      // Compare with hashed password
      isMatch = await bcrypt.compare(password, teacher.password);
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
    teacher.password = await bcrypt.hash(newPassword, salt);
    teacher.passwordUpdate = true; // mark password as updated
    await teacher.save();

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("UpdatePassword error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
