import AnonymousId from "../../model/anonymous/anonymous.model.js";
import Student from "../../model/student/student.model.js";
import Teacher from "../../model/teachers/teachers.model.js";
import Chat from "../../model/chat/chat.model.js";
import {
  generateAnonymousIdWithHash,
  isValidAnonymousId,
} from "../../utils/anonymousId.js";

/**
 * Get all active anonymous IDs for a student
 */
export const getStudentAnonIds = async (req, res) => {
  try {
    const studentId = req.user.id;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const anonIds = await AnonymousId.find({
      studentId,
      isActive: true,
    }).populate("teacherId", "name department");

    const formattedAnonIds = anonIds.map((a) => ({
      anonId: a.anonId,
      teacher: {
        id: a.teacherId._id,
        name: a.teacherId.name,
        department: a.teacherId.department,
      },
      createdAt: a.createdAt,
      lastUsed: a.lastUsed,
      usageCount: a.usageCount,
    }));

    res.status(200).json({
      message: "Anonymous IDs retrieved successfully",
      student: { id: student._id, name: student.name },
      anonIds: formattedAnonIds,
    });
  } catch (error) {
    console.error("Get student anonIds error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Regenerate a single anonymous ID for a student-teacher pair
 */
export const regenerateAnonId = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { teacherId } = req.body;

    if (!teacherId)
      return res.status(400).json({ message: "Teacher ID is required" });

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    // Generate new anonymous ID
    const { anonId: newAnonId, hash } = generateAnonymousIdWithHash();

    // Deactivate old IDs for this pair
    const oldAnonIds = await AnonymousId.find({
      studentId,
      teacherId,
      isActive: true,
    });
    await Promise.all(oldAnonIds.map((a) => a.deactivate()));

    // Create new anonId
    const newAnonIdDoc = await AnonymousId.create({
      anonId: newAnonId,
      studentId,
      teacherId,
      hash,
      isActive: true,
    });

    // Update Chat: create new student entry, orphan old messages
    const chatDoc = await Chat.findOne({ teacher: teacherId });
    if (chatDoc) {
      const oldEntry = chatDoc.students.find(
        (s) => s.studentId?.toString() === studentId && s.isActive !== false
      );
      if (oldEntry) {
        oldEntry.isActive = false;
        oldEntry.deactivatedAt = new Date();
      }

      chatDoc.students.push({
        anonId: newAnonId,
        studentId,
        messages: [],
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
      });

      await chatDoc.save();
    }

    res.status(200).json({
      message: "Anonymous ID regenerated successfully",
      newAnonId,
      teacher: {
        id: teacher._id,
        name: teacher.name,
        department: teacher.department,
      },
      createdAt: newAnonIdDoc.createdAt,
    });
  } catch (error) {
    console.error("Regenerate anonId error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get anon ID history for a student (active + inactive)
 */
export const getAnonIdHistory = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { teacherId } = req.query;

    const query = { studentId };
    if (teacherId) query.teacherId = teacherId;

    const anonIds = await AnonymousId.find(query)
      .populate("teacherId", "name department")
      .sort({ createdAt: -1 });

    const history = anonIds.map((a) => ({
      anonId: a.anonId,
      teacher: {
        id: a.teacherId._id,
        name: a.teacherId.name,
        department: a.teacherId.department,
      },
      isActive: a.isActive,
      createdAt: a.createdAt,
      lastUsed: a.lastUsed,
      usageCount: a.usageCount,
      deactivatedAt: a.isActive ? null : a.updatedAt,
    }));

    res
      .status(200)
      .json({ message: "Anonymous ID history retrieved", history });
  } catch (error) {
    console.error("Get anonId history error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Deactivate a single anonymous ID (teacher action)
 */
export const deactivateAnonId = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { anonId } = req.params;

    if (!anonId)
      return res.status(400).json({ message: "Anonymous ID is required" });
    if (!isValidAnonymousId(anonId))
      return res.status(400).json({ message: "Invalid anonymous ID" });

    const anonDoc = await AnonymousId.findOne({
      anonId,
      teacherId,
      isActive: true,
    });
    if (!anonDoc)
      return res
        .status(404)
        .json({ message: "Anonymous ID not found or already inactive" });

    await anonDoc.deactivate();

    res.status(200).json({
      message: "Anonymous ID deactivated successfully",
      anonId: anonDoc.anonId,
      deactivatedAt: anonDoc.updatedAt,
    });
  } catch (error) {
    console.error("Deactivate anonId error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Reset all anonymous IDs for a student (global regen)
 */
export const resetAllAnonIds = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const activeAnonIds = await AnonymousId.find({
      studentId,
      isActive: true,
    }).populate("teacherId", "name department");
    if (!activeAnonIds.length)
      return res.status(404).json({ message: "No active anonymous IDs found" });

    const resetResults = [];
    const errors = [];

    for (const oldDoc of activeAnonIds) {
      try {
        const { anonId: newAnonId, hash } = generateAnonymousIdWithHash();

        await oldDoc.deactivate();

        const newDoc = await AnonymousId.create({
          anonId: newAnonId,
          studentId,
          teacherId: oldDoc.teacherId,
          hash,
          isActive: true,
        });

        const chatDoc = await Chat.findOne({ teacher: oldDoc.teacherId });
        if (chatDoc) {
          const oldEntry = chatDoc.students.find(
            (s) => s.studentId?.toString() === studentId && s.isActive !== false
          );
          if (oldEntry) {
            oldEntry.isActive = false;
            oldEntry.deactivatedAt = new Date();
          }

          chatDoc.students.push({
            anonId: newAnonId,
            studentId,
            messages: [],
            createdAt: new Date(),
            lastActivity: new Date(),
            isActive: true,
          });

          await chatDoc.save();
        }

        resetResults.push({
          oldAnonId: oldDoc.anonId,
          newAnonId,
          teacher: {
            id: oldDoc.teacherId._id,
            name: oldDoc.teacherId.name,
            department: oldDoc.teacherId.department,
          },
          resetAt: new Date(),
        });
      } catch (err) {
        errors.push({
          oldAnonId: oldDoc.anonId,
          error: err.message,
          teacher: {
            id: oldDoc.teacherId._id,
            name: oldDoc.teacherId.name,
            department: oldDoc.teacherId.department,
          },
        });
      }
    }

    res.status(200).json({
      message: "All anonymous IDs reset successfully",
      student: { id: student._id, name: student.name },
      resetResults,
      errors,
      summary: {
        total: activeAnonIds.length,
        successful: resetResults.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    console.error("Reset all anonIds error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
