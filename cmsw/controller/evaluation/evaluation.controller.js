//evaluation.controller.js
import Student from "../../model/student/student.model.js";
import Marks from "../../model/student/marks.model.js";
import Teacher from "../../model/teachers/teachers.model.js";

export const studentlists = async (req, res) => {
  try {
    const courseId = req.course;
    const semsterId = req.semster;
    const students = await Student.find({
      course: courseId,
      semester: semsterId,
    })
      .sort({ name: 1 })
      .select("name register admission phone DOB");

    res.status(200).json(students);
  } catch (err) {
    console.error("Fetch student names error:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

// Function to insert marks for a single student (legacy function)
// export const insertMarks = async (req, res) => {
//   try {

//     const teacherId = req.user.id;
//     if (!teacherId) {
//       return res.status(400).json({ message: "Teacher ID is required" });
//     }
//     const teacher = await Teacher.findById(teacherId);
//     if (!teacher) {
//       return res.status(404).json({ message: "Teacher not found" });
//     }

//     const { studentId, examName, date, subject, marks, total, course,semster } = req.body;
//     if (!course || !semster) {
//       return res.status(400).json({ message: "Course and semester are required" });
//     }

//     // Validate required fields
//     if (!studentId || !examName || !subject || marks === undefined || total === undefined) {
//       return res.status(400).json({
//         message: "Missing required fields: studentId, examName, subject, marks, total"
//       });
//     }

//     // Check if student exists
//     const student = await Student.findById(studentId);
//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     // Check if marks record already exists for this student
//     let marksRecord = await Marks.findOne({ student: studentId });

//     if (!marksRecord) {
//       // Create new marks record
//       marksRecord = new Marks({
//         student: studentId,
//         marks: [{
//           examName,
//           date: date || new Date().toISOString().split('T')[0],
//           subject,
//           marks,
//           total
//         }]
//       });
//     } else {
//       // Add new mark to existing record
//       marksRecord.marks.push({
//         examName,
//         date: date || new Date().toISOString().split('T')[0],
//         subject,
//         marks,
//         total
//       });
//     }

//     await marksRecord.save();

//     res.status(201).json({
//       message: "Marks inserted successfully",
//       data: marksRecord
//     });

//   } catch (err) {
//     console.error("Insert marks error:", err);
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: err.message
//     });
//   }
// };

// Function to insert marks for multiple students with recurring fields
export const insertBulkMarks = async (req, res) => {
  try {
    const teacherId = req.user.id;
    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const { examName, date, subject, total, course, semster, studentMarks } =
      req.body;

    if (!course || !semster) {
      return res
        .status(400)
        .json({ message: "Course and semester are required" });
    }

    if (!examName || !subject || total === undefined) {
      return res.status(400).json({
        message: "Missing required recurring fields: examName, subject, total",
      });
    }

    if (!Array.isArray(studentMarks) || studentMarks.length === 0) {
      return res.status(400).json({
        message: "studentMarks must be a non-empty array",
      });
    }

    const examDate = date || new Date().toISOString().split("T")[0];
    const results = [];
    const errors = [];

    for (const studentMark of studentMarks) {
      try {
        const { studentId, marks } = studentMark;

        if (!studentId || marks === undefined) {
          errors.push({ studentId, error: "studentId and marks are required" });
          continue;
        }

        const student = await Student.findById(studentId);
        if (!student) {
          errors.push({ studentId, error: "Student not found" });
          continue;
        }

        let marksRecord = await Marks.findOne({ studentId });

        if (!marksRecord) {
          // Create new record with semester and marks
          marksRecord = new Marks({
            studentId,
            course,
            slortes: [
              {
                semester: semster,
                marks: [
                  {
                    examName,
                    date: examDate,
                    subject,
                    marks,
                    total,
                  },
                ],
              },
            ],
          });
        } else {
          // Check if the semester already exists
          let semesterEntry = marksRecord.slortes.find(
            (entry) => entry.semester.toString() === semster.toString()
          );

          if (!semesterEntry) {
            // Add new semester entry
            marksRecord.slortes.push({
              semester: semster,
              marks: [
                {
                  examName,
                  date: examDate,
                  subject,
                  marks,
                  total,
                },
              ],
            });
          } else {
            // Add marks to existing semester
            semesterEntry.marks.push({
              examName,
              date: examDate,
              subject,
              marks,
              total,
            });
          }
        }

        await marksRecord.save();

        results.push({
          studentId,
          studentName: student.name,
          success: true,
          message: "Marks inserted successfully",
        });
      } catch (error) {
        errors.push({
          studentId: studentMark.studentId,
          error: error.message,
        });
      }
    }

    return res.status(201).json({
      message: "Bulk marks insertion completed",
      summary: {
        total: studentMarks.length,
        successful: results.length,
        failed: errors.length,
      },
      results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("Insert bulk marks error:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// Function to view marks for a specific student
export const viewMarks = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate studentId
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Find marks for the student
    const marksRecord = await Marks.findOne({ student: studentId }).populate(
      "marks.subject",
      "name"
    );

    if (!marksRecord || !marksRecord.marks.length) {
      return res
        .status(404)
        .json({ message: "No marks found for this student" });
    }

    // Calculate performance metrics
    const marksWithPerformance = marksRecord.marks.map((mark) => {
      const percentage =
        mark.total > 0 ? Math.floor((mark.marks / mark.total) * 100) : 0;

      let performance = "";
      if (percentage < 40) performance = "Bad";
      else if (percentage < 60) performance = "Average";
      else if (percentage < 80) performance = "Good";
      else performance = "Excellent";

      return {
        id: mark._id,
        examName: mark.examName,
        date: mark.date,
        subject: mark.subject,
        marks: mark.marks,
        total: mark.total,
        percentage,
        performance,
      };
    });

    res.status(200).json({
      student: {
        id: student._id,
        name: student.name,
        register: student.register,
      },
      marks: marksWithPerformance,
    });
  } catch (err) {
    console.error("View marks error:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
