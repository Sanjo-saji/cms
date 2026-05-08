import Teacher from "../../model/teachers/teachers.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const RegisterAdmin = async (req, res) => {
  const { employeeId, password } = req.body;

  if (!employeeId || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    // find teacher by employee_id
    const user = await Teacher.findOne({ employee_id: employeeId }).populate(
      "classInCharge"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let isMatch = false;
    if (user.role === "Principal") {
      // Principal → only bcrypt check
      isMatch = await bcrypt.compare(password, user.password);
    } else if (user.role === "HOD" || user.role === "Teacher") {
      if (!user.passwordUpdate) {
        // First-time login with DOB
        const normalizedDOB = password.replace(/[^0-9]/g, "");
        isMatch = await bcrypt.compare(normalizedDOB, user.password);
      } else {
        // Already updated → bcrypt check
        isMatch = await bcrypt.compare(password, user.password);
      }
    }
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    //  Role checks
    if (user.role === "Principal" || user.role === "HOD") {
      // allowed
    } else if (user.role === "Teacher") {
      if (!user.classInCharge) {
        return res.status(403).json({
          success: false,
          message: "Access denied: Teacher must be class in charge",
        });
      }
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: unauthorized role" });
    }

    // 🔑 Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7d",
    });

    //  Send cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("RegisterAdmin error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const LogoutAdmin = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ success: true, message: "Logged out" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing teacher" });
    }

    const teacher = await Teacher.findById(teacherId)
      .populate("department", "name")
      .lean();

    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }
    const baseUrl = "http://miserably-arriving-adder.ngrok-free.app";

    res.json({
      success: true,
      data: {
        name: teacher.name,
        image: teacher.image
          ? `${baseUrl}/uploads/teachers/${teacher.image}`
          : null,
        department: teacher.department?.name || null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const UpdateAdminPassword = async (req, res) => {
  try {
    const { password, newPassword, confirmPass } = req.body;
    const adminId = req.user.id;

    const admin = await Teacher.findById(adminId);
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    let isMatch = false;

    if (admin.role !== "Principal" && !admin.passwordUpdate) {
      // Only non-Principals with default DOB passwords use normalized DOB
      const normalizedDOB = admin.dob.replace(/[^0-9]/g, "");
      isMatch = password === normalizedDOB;
    } else {
      // Principals and updated accounts always use hashed password
      isMatch = await bcrypt.compare(password, admin.password);
    }

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect current password" });
    }

    if (newPassword !== confirmPass) {
      return res
        .status(400)
        .json({ success: false, message: "New passwords do not match" });
    }

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    admin.passwordUpdate = true;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Admin password updated successfully",
    });
  } catch (error) {
    console.error("UpdateAdminPassword error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
