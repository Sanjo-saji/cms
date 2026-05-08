import Student from "../../model/student/student.model.js";
import Subject from "../../model/student/subjects.model.js";
import NotesSchema from "../../model/notes/notes.model.js";
import Course from "../../model/course/course.model.js";
import Semester from "../../model/semester/semesters.model.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import os from "os";
import multer from "multer";
import TeacherAssignmentSchedule from "../../model/teachers/assign.model.js";

export const upload = multer({ storage: multer.memoryStorage() });

export const getStudentNotes = async (req, res) => {
  try {
    const studentId = req.user.id;
    // Define the base URL to construct the full image path
    const baseUrl = "http://miserably-arriving-adder.ngrok-free.app";

    const student = await Student.findById(studentId)
      .populate("course", "name")
      .populate("semester", "name")
      .lean();

    if (!student || !student.course || !student.semester) {
      return res
        .status(404)
        .json({ message: "Student or related data not found" });
    }

    const courseId = student.course._id;
    const semesterId = student.semester._id;

    const subjects = await Subject.find({
      course: courseId,
      semester: semesterId,
    }).lean();

    if (!subjects.length) {
      return res.status(404).json({ message: "No subjects found" });
    }

    const noteDoc = await NotesSchema.findOne({
      courseid: courseId,
      semsterid: semesterId,
    }).lean();

    const result = subjects.map((subject) => {
      const matchedNote = noteDoc?.notes?.find(
        (n) => n.subject?.toString() === subject._id.toString()
      );

      return {
        id: subject._id,
        subject: subject.name,
        // MODIFIED: Construct the full image URL, same as in the teacher function
        image: subject.image
          ? `${baseUrl}/uploads/icons/${subject.image}`
          : null,
        pdfs:
          matchedNote?.pdfs.map((pdf) => ({
            name: pdf.name,
            url: `/student/notes/${subject.name}/${pdf.name}`,
          })) || [],
      };
    });

    return res.status(200).json({
      message: "Student notes fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const downloadNotePDF = async (req, res) => {
  try {
    const { subjectName, pdfName } = req.params;

    // Search all notes that contain a subject matching the name
    const noteDoc = await NotesSchema.findOne({
      "notes.pdfs.name": pdfName,
    })
      .populate("notes.subject", "name")
      .populate("courseid", "name")
      .populate("semsterid", "name")
      .lean();

    if (!noteDoc) {
      return res.status(404).json({ message: "Note not found" });
    }

    const matchedNote = noteDoc.notes.find(
      (n) =>
        n.subject?.name === subjectName &&
        n.pdfs.some((pdf) => pdf.name === pdfName)
    );

    if (!matchedNote) {
      return res
        .status(403)
        .json({ message: "Unauthorized or file not found" });
    }

    // Build file path: ~/notes/<course>/<semester>/<subject>/<pdfName>
    const filePath = path.join(
      os.homedir(),
      "notes",
      noteDoc.courseid.name,
      noteDoc.semsterid.name,
      subjectName,
      pdfName
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File does not exist" });
    }

    res.download(filePath, pdfName, (err) => {
      if (err) {
        console.error("Download error:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error downloading file" });
        }
      }
    });
  } catch (error) {
    console.error("Download error:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
};

export const uploadNotePDF = async (req, res) => {
  try {
    const { course, semster, subjectId } = req.body;

    // Debug incoming fields
    console.log("📥 Upload body:", { course, semster, subjectId });

    if (!course || !semster || !subjectId) {
      return res
        .status(400)
        .json({ message: "Course, Semester, and Subject are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const pdfName = req.file.originalname;

    // Fetch document data
    const [courseDoc, semesterDoc, subjectDoc] = await Promise.all([
      Course.findById(course).lean(),
      Semester.findById(semster).lean(),
      Subject.findById(subjectId).lean(),
    ]);

    console.log("📚 courseDoc:", courseDoc);
    console.log("📚 semesterDoc:", semesterDoc);
    console.log("📚 subjectDoc:", subjectDoc);

    if (!courseDoc || !semesterDoc || !subjectDoc) {
      return res
        .status(400)
        .json({ message: "Invalid Course, Semester, or Subject" });
    }

    // Create target directory
    const dirPath = path.join(
      os.homedir(),
      "notes",
      courseDoc.name,
      semesterDoc.name,
      subjectDoc.name
    );
    fs.mkdirSync(dirPath, { recursive: true });

    // Write file to disk
    const filePath = path.join(dirPath, pdfName);
    fs.writeFileSync(filePath, req.file.buffer);

    // Save to NotesSchema
    let notesDoc = await NotesSchema.findOne({
      courseid: course,
      semsterid: semster,
    });

    if (!notesDoc) {
      notesDoc = new NotesSchema({
        courseid: course,
        semsterid: semster,
        notes: [],
      });
    }

    let noteEntry = notesDoc.notes.find(
      (note) => note.subject.toString() === subjectId
    );

    if (!noteEntry) {
      notesDoc.notes.push({
        subject: subjectId,
        pdfs: [{ name: pdfName }],
      });
    } else {
      const alreadyExists = noteEntry.pdfs.some((pdf) => pdf.name === pdfName);
      if (!alreadyExists) {
        noteEntry.pdfs.push({ name: pdfName });
      }
    }

    await notesDoc.save();

    return res.status(200).json({ message: "Note uploaded successfully" });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return res
      .status(500)
      .json({ message: "Failed to upload note", error: error.message });
  }
};

export const deleteNotePDF = async (req, res) => {
  try {
    const { courseId, semesterId, subjectId, pdfName } = req.params;

    // 1. Fetch course, semester, and subject names for path
    const [course, semester, subject] = await Promise.all([
      Course.findById(courseId).lean(),
      Semester.findById(semesterId).lean(),
      Subject.findById(subjectId).lean(),
    ]);

    if (!course || !semester || !subject) {
      return res
        .status(404)
        .json({ message: "Invalid course/semester/subject" });
    }

    const filePath = path.join(
      os.homedir(),
      "notes",
      course.name,
      semester.name,
      subject.name,
      pdfName
    );

    // 2. Delete file from disk
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      return res.status(404).json({ message: "File not found on disk" });
    }

    // 3. Remove PDF from database
    const noteDoc = await NotesSchema.findOne({
      courseid: courseId,
      semsterid: semesterId,
    });

    if (!noteDoc) {
      return res
        .status(404)
        .json({ ok: false, message: "Notes document not found" });
    }

    const note = noteDoc.notes.find((n) => n.subject.toString() === subjectId);

    if (!note) {
      return res
        .status(404)
        .json({ ok: false, message: "Subject not found in notes" });
    }

    // Filter out the PDF
    note.pdfs = note.pdfs.filter((pdf) => pdf.name !== pdfName);

    // If no PDFs left for the subject, remove the subject entirely
    if (note.pdfs.length === 0) {
      noteDoc.notes = noteDoc.notes.filter(
        (n) => n.subject.toString() !== subjectId
      );
    }

    await noteDoc.save();

    res.status(200).json({ ok: true, message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      ok: false,
      message: "Failed to delete note",
      error: error.message,
    });
  }
};

export const checkAssignment = async (req, res) => {
  try {
    const { course, semester, subjectId } = req.body;
    const teacherId = req.user.id;

    if (!course || !semester || !subjectId) {
      return res
        .status(400)
        .json({ message: "Course, Semester, and Subject are required" });
    }

    // FIX: Convert string IDs from the request body to ObjectIds
    const courseObjId = new mongoose.Types.ObjectId(course);
    const semesterObjId = new mongoose.Types.ObjectId(semester);
    const subjectObjId = new mongoose.Types.ObjectId(subjectId);

    const isAssigned = await TeacherAssignmentSchedule.findOne({
      teacher: teacherId,
      "schedule.contents": {
        $elemMatch: {
          // Use the converted ObjectId variables in the query
          course: courseObjId,
          semester: semesterObjId,
          subject: subjectObjId,
        },
      },
    });

    return res.json({ assigned: !!isAssigned });
  } catch (error) {
    console.error("Assignment check error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTeacherSubjectNotes = async (req, res) => {
  try {
    const { course, semster } = req;

    if (!course || !semster) {
      return res
        .status(400)
        .json({ message: "Course and Semester are required" });
    }

    const baseUrl = "http://miserably-arriving-adder.ngrok-free.app";

    // Step 1: Fetch all subjects for the selected course and semester
    const subjects = await Subject.find({
      course: course,
      semester: semster,
    }).lean();

    if (!subjects.length) {
      return res.status(404).json({ message: "No subjects found" });
    }

    // Step 2: Fetch the Notes document for that course and semester
    const noteDoc = await NotesSchema.findOne({
      courseid: course,
      semsterid: semster,
    }).lean();

    // Step 3: Combine subject data with PDF notes
    const result = subjects.map((subj) => {
      const matchedNote = noteDoc?.notes?.find(
        (n) => n.subject?.toString() === subj._id.toString()
      );

      return {
        id: subj._id,
        subject: subj.name,
        image: subj.image ? `${baseUrl}/uploads/icons/${subj.image}` : null,
        pdfs:
          matchedNote?.pdfs.map((pdf) => ({
            name: pdf.name,
            url: `/teacher/notes/${subj.name}/${pdf.name}`,
          })) || [],
      };
    });

    return res.status(200).json({
      message: "Subjects with notes fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
