import Chat from "../../model/chat/chat.model.js";
import Teacher from "../../model/teachers/teachers.model.js";
import Student from "../../model/student/student.model.js";
// --- (CHANGE 1) ADD a reference to the AnonymousId model and the correct generator ---
import AnonymousId from "../../model/anonymous/anonymous.model.js";
import {
  generateAnonymousIdWithHash,
  isValidAnonymousId,
} from "../../utils/anonymousId.js";

// --- (CHANGE 2) THE `sendStudentMessage` FUNCTION IS REWRITTEN ---
// Send a message from student to teacher
export const sendStudentMessage = async (req, res) => {
  try {
    const { teacherId, message } = req.body;
    const studentId = req.user.id;

    if (!teacherId || !message) {
      return res.status(400).json({
        message: "Teacher ID and message are required",
      });
    }

    // --- NEW LOGIC START: Find or Create the persistent Anonymous ID ---
    let anonIdRecord = await AnonymousId.findOne({
      studentId,
      teacherId,
      isActive: true,
    });

    let currentAnonId;

    if (!anonIdRecord) {
      console.log(
        `No active AnonymousId found for student ${studentId} and teacher ${teacherId}. Creating a new one.`
      );
      // Generate a new ID and hash using the robust method
      const { anonId: newAnonId, hash } = generateAnonymousIdWithHash();

      anonIdRecord = await AnonymousId.create({
        anonId: newAnonId,
        studentId,
        teacherId,
        hash,
        isActive: true,
      });
      currentAnonId = newAnonId;
    } else {
      console.log(`Found existing AnonymousId: ${anonIdRecord.anonId}`);
      currentAnonId = anonIdRecord.anonId;
      // Optionally update usage stats
      anonIdRecord.lastUsed = new Date();
      anonIdRecord.usageCount = (anonIdRecord.usageCount || 0) + 1;
      await anonIdRecord.save();
    }
    // --- NEW LOGIC END ---

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    let chatDoc = await Chat.findOne({ teacher: teacherId });

    if (!chatDoc) {
      chatDoc = new Chat({
        teacher: teacherId,
        students: [],
      });
    }

    // Find existing ACTIVE student entry by studentId
    let studentEntry = chatDoc.students.find(
      (s) =>
        s.studentId &&
        s.studentId.toString() === studentId &&
        s.isActive !== false
    );

    // If no active entry exists, create one
    if (!studentEntry) {
      console.log(
        "Creating new student chat entry with persistent anonId:",
        currentAnonId
      );

      studentEntry = {
        // Use the persistent anonId from the AnonymousId model
        anonId: currentAnonId,
        studentId: studentId,
        messages: [],
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
      };
      chatDoc.students.push(studentEntry);
    } else {
      // This is important: ensure the anonId in the chat document matches the active one.
      // This handles cases where an ID was reset but the old chat entry was not yet used.
      studentEntry.anonId = currentAnonId;
    }

    studentEntry.messages.push({
      sender: "student",
      text: message,
      timestamp: new Date(),
    });

    studentEntry.lastActivity = new Date();

    await chatDoc.save();

    res.status(201).json({
      message: "Message sent successfully",
      chat: {
        teacherId,
        anonId: studentEntry.anonId,
        message: {
          sender: "student",
          text: message,
          timestamp: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("Send student message error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- NO CHANGES to the functions below this line ---

// Send a message from teacher to student
export const sendTeacherMessage = async (req, res) => {
  try {
    const { anonId, message } = req.body;
    const teacherId = req.user.id;

    if (!anonId || !message) {
      return res.status(400).json({
        message: "Anonymous ID and message are required",
      });
    }

    if (!isValidAnonymousId(anonId)) {
      return res.status(400).json({
        message: "Invalid anonymous ID format",
      });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    let chatDoc = await Chat.findOne({ teacher: teacherId });

    if (!chatDoc) {
      return res.status(404).json({
        message: "No chat found for this teacher",
      });
    }

    const studentEntry = chatDoc.students.find((s) => s.anonId === anonId);

    if (!studentEntry) {
      return res.status(404).json({
        message: "Student with this anonymous ID not found in chat",
      });
    }

    studentEntry.messages.push({
      sender: "teacher",
      text: message,
      timestamp: new Date(),
    });

    studentEntry.lastActivity = new Date();

    await chatDoc.save();

    res.status(201).json({
      message: "Message sent successfully",
      chat: {
        teacherId,
        anonId: studentEntry.anonId,
        message: {
          sender: "teacher",
          text: message,
          timestamp: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("Send teacher message error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get chat history for a teacher
export const getTeacherChats = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const chatDoc = await Chat.findOne({ teacher: teacherId }).populate(
      "teacher",
      "name"
    );

    if (!chatDoc) {
      return res.status(200).json({
        message: "No chats found",
        students: [],
      });
    }

    // Group students by studentId to show all anonIds for each student
    const studentGroups = {};
    
    chatDoc.students.forEach((student) => {
      if (student.studentId && Array.isArray(student.messages) && student.messages.length > 0) {
        const studentIdStr = student.studentId.toString();
        
        if (!studentGroups[studentIdStr]) {
          studentGroups[studentIdStr] = {
            studentId: studentIdStr,
            anonIds: [],
            totalMessages: 0,
            lastActivity: student.lastActivity,
            firstCreatedAt: student.createdAt,
          };
        }
        
        studentGroups[studentIdStr].anonIds.push({
          anonId: student.anonId,
          isActive: student.isActive !== false,
          messageCount: student.messages.length,
          lastActivity: student.lastActivity,
          createdAt: student.createdAt,
          deactivatedAt: student.deactivatedAt,
        });
        
        studentGroups[studentIdStr].totalMessages += student.messages.length;
        
        // Update the most recent activity
        if (new Date(student.lastActivity) > new Date(studentGroups[studentIdStr].lastActivity)) {
          studentGroups[studentIdStr].lastActivity = student.lastActivity;
        }
        
        // Update the earliest creation date
        if (new Date(student.createdAt) < new Date(studentGroups[studentIdStr].firstCreatedAt)) {
          studentGroups[studentIdStr].firstCreatedAt = student.createdAt;
        }
      }
    });

    // Convert to array and sort by last activity
    const students = Object.values(studentGroups).sort(
      (a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)
    );

    res.status(200).json({
      message: "Chats retrieved successfully",
      teacher: chatDoc.teacher,
      students,
    });
  } catch (error) {
    console.error("Get teacher chats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get chat history for a student with a specific teacher
export const getStudentChat = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const studentId = req.user.id;

    if (!teacherId) {
      return res.status(400).json({
        message: "Teacher ID is required",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const chatDoc = await Chat.findOne({ teacher: teacherId }).populate(
      "teacher",
      "name"
    );

    if (!chatDoc) {
      return res.status(200).json({
        message: "No chat found with this teacher",
        teacher: null,
        anonId: null,
        messages: [],
      });
    }

    const studentEntry = chatDoc.students.find(
      (s) =>
        // --- THIS CONDITION IS CORRECTED ---
        s.studentId &&
        s.studentId.toString() === studentId &&
        s.isActive !== false
    );

    if (!studentEntry) {
      return res.status(200).json({
        message: "No messages found",
        teacher: chatDoc.teacher,
        anonId: null,
        messages: [],
      });
    }

    res.status(200).json({
      message: "Chat retrieved successfully",
      teacher: chatDoc.teacher,
      anonId: studentEntry.anonId,
      messages: studentEntry.messages,
    });
  } catch (error) {
    console.error("Get student chat error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get chat history for a teacher with a specific student by anonId
export const getTeacherStudentChat = async (req, res) => {
  try {
    const { anonId } = req.params;
    const teacherId = req.user.id;

    if (!anonId) {
      return res.status(400).json({
        message: "Anonymous ID is required",
      });
    }

    if (!isValidAnonymousId(anonId)) {
      return res.status(400).json({
        message: "Invalid anonymous ID format",
      });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const chatDoc = await Chat.findOne({ teacher: teacherId }).populate(
      "teacher",
      "name"
    );

    if (!chatDoc) {
      return res.status(404).json({
        message: "No chat found for this teacher",
      });
    }

    // Find the current student entry with the provided anonId
    const currentStudentEntry = chatDoc.students.find((s) => s.anonId === anonId);

    if (!currentStudentEntry) {
      return res.status(200).json({
        message: "No messages found with this anonymous ID",
        teacher: chatDoc.teacher,
        anonId: anonId,
        messages: [],
        historicalMessages: [],
      });
    }

    // Get the studentId from the current entry to find all historical messages
    const studentId = currentStudentEntry.studentId;

    // Find ALL student entries for this student (both active and inactive)
    const allStudentEntries = chatDoc.students.filter(
      (s) => s.studentId && s.studentId.toString() === studentId.toString()
    );

    // Combine all messages from all anonIds for this student
    const allMessages = [];
    const historicalMessages = [];

    allStudentEntries.forEach((entry) => {
      if (entry.messages && entry.messages.length > 0) {
        entry.messages.forEach((message) => {
          const messageWithAnonId = {
            ...message.toObject(),
            anonId: entry.anonId,
            isActive: entry.isActive !== false,
            createdAt: entry.createdAt,
            lastActivity: entry.lastActivity,
          };
          
          if (entry.anonId === anonId) {
            // Current anonId messages
            allMessages.push(messageWithAnonId);
          } else {
            // Historical anonId messages
            historicalMessages.push(messageWithAnonId);
          }
        });
      }
    });

    // Sort all messages by timestamp
    const sortedAllMessages = [...allMessages, ...historicalMessages].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    res.status(200).json({
      message: "Chat retrieved successfully",
      teacher: chatDoc.teacher,
      anonId: currentStudentEntry.anonId,
      messages: sortedAllMessages,
      currentMessages: allMessages,
      historicalMessages: historicalMessages,
    });
  } catch (error) {
    console.error("Get teacher student chat error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// --- (CHANGE 3) THE OLD, FLAWED FUNCTION IS COMMENTED OUT ---

/*
 * @deprecated This function uses a flawed global ID logic.
 * Use the resetAllAnonIds function from anonymous.controller.js instead.
 * It is kept here for reference but should be deleted.
 */
// export const regenerateAnonIdGlobal = async (req, res) => {
//   try {
//     const studentId = req.user.id;
//     console.log("Regenerating global anonId for student:", studentId);
//     const student = await Student.findById(studentId);
//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }
//     const chats = await Chat.find({ "students.studentId": studentId });
//     if (chats.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No chat entries found for student" });
//     }
//     const newGlobalAnonId = generateAnonymousId();
//     console.log("New global anonId generated:", newGlobalAnonId);
//     let updated = false;
//     let updatedChats = 0;
//     for (const chatDoc of chats) {
//       const oldStudentEntry = chatDoc.students.find(
//         (s) => s.studentId && s.studentId.toString() === studentId
//       );
//       if (oldStudentEntry) {
//         const newStudentEntry = {
//           anonId: newGlobalAnonId,
//           studentId: studentId,
//           messages: [],
//           createdAt: new Date(),
//           lastActivity: new Date(),
//           isActive: true,
//         };
//         chatDoc.students.push(newStudentEntry);
//         oldStudentEntry.isActive = false;
//         oldStudentEntry.deactivatedAt = new Date();
//         updated = true;
//         updatedChats++;
//         console.log(
//           `Created new entry in chat with teacher ${chatDoc.teacher}: ${oldStudentEntry.anonId} → ${newGlobalAnonId} (old messages orphaned)`
//         );
//       }
//     }
//     if (!updated) {
//       return res
//         .status(404)
//         .json({ message: "No chat entry found for student" });
//     }
//     await Promise.all(chats.map((chat) => chat.save()));
//     console.log(`Successfully updated ${updatedChats} chat documents`);
//     res.status(200).json({
//       message: "Global anonymous ID regenerated successfully",
//       oldAnonIds: chats
//         .map((chat) => {
//           const oldEntry = chat.students.find(
//             (s) =>
//               s.studentId && s.studentId.toString() === studentId && !s.isActive
//           );
//           return oldEntry ? oldEntry.anonId : null;
//         })
//         .filter(Boolean),
//       newGlobalAnonId: newGlobalAnonId,
//       updatedChats: updatedChats,
//       student: {
//         id: student._id,
//         name: student.name,
//       },
//       note: "Old messages are no longer tied to the new anonymous ID for privacy",
//     });
//   } catch (error) {
//     console.error("Regenerate global anonId error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
