import Teacher from "../../model/teachers/teachers.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const RegisterTeacher = async (req, res) => {
  const { employeeId, password } = req.body;
  console.log(password);

  if (!employeeId || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    // Find teacher by employee_id
    const user = await Teacher.findOne({ employee_id: employeeId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let isMatch = false;

    // Case 1: If teacher never updated password → check with DOB
    if (!user.passwordUpdate) {
      const normalizedDOB = password.replace(/[^0-9]/g, ""); // remove all non-digits
      isMatch = await bcrypt.compare(normalizedDOB, user.password);
    } else {
      // Case 2: Compare with updated password
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    // Set cookie with token
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log("Teacher login successful:", user.employee_id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      teacher: {
        id: user._id,
        name: user.name,
        role: user.role,
        employee_id: user.employee_id,
      },
    });
  } catch (error) {
    console.error("RegisterTeacher error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const LogoutTeacher = (req, res) => {
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
    const teacherId = req.user.id; // from auth middleware

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    let isMatch = false;

    // 🔑 Case 1: First login (default password = DOB)
    if (!teacher.passwordUpdate) {
      const normalizedDOB = password.replace(/[^0-9]/g, "");
      isMatch = await bcrypt.compare(normalizedDOB, teacher.password);
    } else {
      // 🔑 Case 2: Already updated → check hashed
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

    // // 🚫 Prevent reset to DOB if already updated
    // const normalizedDOB = password.replace(/[^0-9]/g, "");
    // if (teacher.passwordUpdate && newPassword === normalizedDOB) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Cannot reset password back to DOB",
    //   });
    // }

    // 🔑 Hash and update
    const salt = await bcrypt.genSalt(10);
    teacher.password = await bcrypt.hash(newPassword, salt);
    teacher.passwordUpdate = true;

    await teacher.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("UpdatePassword error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
