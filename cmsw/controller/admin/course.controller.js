import Course from "../../model/course/course.model.js";
import Semester from "../../model/semester/semesters.model.js";
import Teacher from "../../model/teachers/teachers.model.js";
import Class from "../../model/class/class.model.js";
import Subject from "../../model/student/subjects.model.js";
import TimeTable from "../../model/student/Timetable.model.js";
import Marks from "../../model/student/marks.model.js";
import Event from "../../model/events/events.model.js";
import NotesSchema from "../../model/notes/notes.model.js";
import mongoose from "mongoose";

// Create a new course
export const createCourse = async (req, res) => {
  const { name, courseName, durationYears } = req.body;

  try {
    // Ensure only Principal can create a course
    if (!req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const admin = await Teacher.findById(req.user.id);
    if (!admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (admin.role !== "Principal") {
      return res.status(403).json({
        success: false,
        message: "Access denied: only Principal can create a course",
      });
    }

    // Validate required fields
    if (!name || !courseName || !durationYears) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, courseName, and durationYears are required",
      });
    }

    // Validate durationYears is a number
    if (
      typeof durationYears !== "number" ||
      durationYears < 1 ||
      durationYears > 10
    ) {
      return res.status(400).json({
        success: false,
        message: "durationYears must be a number between 1 and 10",
      });
    }

    // Check if course already exists (by courseName)
    const existingCourse = await Course.findOne({ courseName });
    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: "Course with this name already exists",
      });
    }

    // Create new course
    const course = await Course.create({
      name,
      courseName,
      durationYears,
    });

    // Auto-create semesters for the course
    const createdSemesters = [];

    // Always auto-name semesters in database as {courseName}_S{number}
    const totalSemesters = durationYears * 2;
    for (let i = 1; i <= totalSemesters; i++) {
      const semesterName = `Semester ${i}`;
      const semester = await Semester.create({
        name: semesterName,
        course: course._id,
      });
      createdSemesters.push(semester);
    }

    return res.status(201).json({
      success: true,
      message: "Course and semesters created successfully",
      course,
      semesters: createdSemesters,
      semesterCount: createdSemesters.length,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      courses,
      count: courses.length,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get course by ID
export const getCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  if (!req.user.id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const admin = await Teacher.findById(req.user.id);
  if (!admin) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (admin.role !== "Principal") {
    return res.status(403).json({
      success: false,
      message: "Access denied: only Principal can Update a course",
    });
  }

  const { id } = req.params;
  const { name, courseName, durationYears } = req.body;

  try {
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if courseName is being changed and if it already exists
    if (courseName && courseName !== course.courseName) {
      const existingCourse = await Course.findOne({ courseName });
      if (existingCourse) {
        return res.status(409).json({
          success: false,
          message: "Course with this name already exists",
        });
      }
    }

    // Validate durationYears if provided
    if (durationYears !== undefined) {
      if (
        typeof durationYears !== "number" ||
        durationYears < 1 ||
        durationYears > 10
      ) {
        return res.status(400).json({
          success: false,
          message: "durationYears must be a number between 1 and 10",
        });
      }
    }

    // Update fields
    if (name) course.name = name;
    if (courseName) course.courseName = courseName;
    if (durationYears !== undefined) course.durationYears = durationYears;

    await course.save();

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  if (!req.user.id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const admin = await Teacher.findById(req.user.id);
  if (!admin) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (admin.role !== "Principal") {
    return res.status(403).json({
      success: false,
      message: "Access denied: only Principal can Delete a course",
    });
  }

  const { id } = req.params;

  try {
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await Course.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Course "${course.courseName}" deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a course and all documents that directly reference the course id
export const deleteCourseAndReferences = async (req, res) => {
  if (!req.user.id) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const admin = await Teacher.findById(req.user.id);
  if (!admin) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (admin.role !== "Principal") {
    return res.status(403).json({
      success: false,
      message: "Access denied: only Principal can create a course",
    });
  }

  const { id } = req.params;

  try {
    // Ensure only Principal can delete a course with cascade
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const admin = await Teacher.findById(req.user.id);
    if (!admin) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (admin.role !== "Principal") {
      return res.status(403).json({
        success: false,
        message:
          "Access denied: only Principal can delete a course and references",
      });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Build deletions list and labels dynamically
    const deletions = [];
    const labels = [];

    // Direct imports
    deletions.push(Class.deleteMany({ course: id }));
    labels.push(["classes", "deletedCount"]);
    deletions.push(Subject.deleteMany({ course: id }));
    labels.push(["subjects", "deletedCount"]);
    deletions.push(TimeTable.deleteMany({ course: id }));
    labels.push(["timetables", "deletedCount"]);
    deletions.push(Marks.deleteMany({ course: id }));
    labels.push(["marks", "deletedCount"]);
    deletions.push(Event.deleteMany({ course: id }));
    labels.push(["events", "deletedCount"]);
    deletions.push(NotesSchema.deleteMany({ courseid: id }));
    labels.push(["notes", "deletedCount"]);
    deletions.push(Semester.deleteMany({ course: id }));
    labels.push(["semesters", "deletedCount"]);

    // Registry-only models (optional)
    const AssignmentModel = mongoose.models.assignments;
    if (AssignmentModel) {
      deletions.push(AssignmentModel.deleteMany({ "assign.course": id }));
      labels.push(["assignments", "deletedCount"]);
    }
    const StudentModel = mongoose.models.students;
    if (StudentModel) {
      deletions.push(StudentModel.deleteMany({ course: id }));
      labels.push(["students", "deletedCount"]);
    }
    const MessagesModel = mongoose.models.Messages;
    if (MessagesModel) {
      deletions.push(MessagesModel.deleteMany({ courseId: id }));
      labels.push(["messages", "deletedCount"]);
    }
    const AttendanceTimesModel = mongoose.models.attendanceTimes;
    if (AttendanceTimesModel) {
      deletions.push(AttendanceTimesModel.deleteMany({ "slote.course": id }));
      labels.push(["attendanceTimes", "deletedCount"]);
    }
    const SchedulesModel = mongoose.models.schedules;
    if (SchedulesModel) {
      deletions.push(
        SchedulesModel.deleteMany({ "schedule.contents.course": id })
      );
      labels.push(["schedules", "deletedCount"]);
    }
    const DepartmentsModel = mongoose.models.departments;
    if (DepartmentsModel) {
      deletions.push(
        DepartmentsModel.updateMany({}, { $pull: { courses: id } })
      );
      labels.push(["departmentsUpdated", "modifiedCount"]);
    }

    const results = await Promise.all(deletions);

    await Course.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Course "${course.courseName}" and related references deleted successfully`,
      deletedCounts: labels.reduce((acc, [key, countKey], idx) => {
        acc[key] = results[idx]?.[countKey] || 0;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error("Error cascading delete for course:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getSemestersByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const semesters = await Semester.find({ course: courseId })
      .select("_id name") //  only return id and name
      .sort({ createdAt: 1 });

    if (!semesters.length) {
      return res
        .status(404)
        .json({ message: "No semesters found for this course" });
    }

    res.json(semesters);
  } catch (error) {
    console.error("Error fetching semesters:", error);
    res.status(500).json({ message: "Server error" });
  }
};
