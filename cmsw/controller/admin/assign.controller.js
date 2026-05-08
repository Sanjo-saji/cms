import Department from "../../model/assignment/department.model.js";
import Subject from "../../model/student/subjects.model.js";
import TeacherAssignmentSchedule from "../../model/teachers/assign.model.js";
import Teacher from "../../model/teachers/teachers.model.js";

//  Add assignment for a teacher
export const addAssignment = async (req, res) => {
  try {
    const { teacherId, course, semester } = req.body;

    if (!teacherId || !course || !semester) {
      return res
        .status(400)
        .json({ message: "Teacher, course, and semester required" });
    }

    let record = await TeacherAssignmentSchedule.findOne({
      teacher: teacherId,
    });

    if (!record) {
      // No record yet, create new
      record = new TeacherAssignmentSchedule({
        teacher: teacherId,
        assignments: [{ course, semester }],
      });
    } else {
      // Check if assignment already exists
      const exists = record.assignments.some(
        (a) =>
          a.course.toString() === course && a.semester.toString() === semester
      );

      if (exists) {
        return res
          .status(400)
          .json({ message: "This assignment already exists for this teacher" });
      }

      // Add new assignment
      record.assignments.push({ course, semester });
    }

    await record.save();

    // Correct way to populate after saving
    await record.populate([
      { path: "assignments.course", select: "name" },
      { path: "assignments.semester", select: "name" },
    ]);

    res.status(200).json({
      message: "Assignment added",
      assignments: record.assignments,
    });
  } catch (error) {
    console.error("Add Assignment Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

//  Get assignments for all teachers
export const getAllAssignments = async (req, res) => {
  try {
    const records = await TeacherAssignmentSchedule.find()
      .populate("teacher", "name")
      .populate("assignments.course", "name")
      .populate("assignments.semester", "name");

    res
      .status(200)
      .json(
        records.map((r) => ({ teacher: r.teacher, assignments: r.assignments }))
      );
  } catch (error) {
    console.error("Get All Assignments Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

//  Update an assignment for a teacher
export const updateAssignment = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { oldCourse, oldSemester, newCourse, newSemester } = req.body;

    if (!oldCourse || !oldSemester || !newCourse || !newSemester) {
      return res
        .status(400)
        .json({ message: "Old and new course/semester required" });
    }

    const record = await TeacherAssignmentSchedule.findOne({
      teacher: teacherId,
    });

    if (!record) return res.status(404).json({ message: "Teacher not found" });

    // Check if old assignment exists
    const assignmentIndex = record.assignments.findIndex(
      (a) =>
        a.course.toString() === oldCourse &&
        a.semester.toString() === oldSemester
    );

    if (assignmentIndex === -1)
      return res.status(404).json({ message: "Assignment not found" });

    // Check if new assignment already exists to prevent duplicates
    const duplicate = record.assignments.some(
      (a) =>
        a.course.toString() === newCourse &&
        a.semester.toString() === newSemester
    );
    if (duplicate)
      return res.status(400).json({ message: "New assignment already exists" });

    // Update assignment
    record.assignments[assignmentIndex].course = newCourse;
    record.assignments[assignmentIndex].semester = newSemester;

    await record.save();

    // Populate after save
    await record.populate([
      { path: "assignments.course", select: "name" },
      { path: "assignments.semester", select: "name" },
    ]);

    res
      .status(200)
      .json({ message: "Assignment updated", assignments: record.assignments });
  } catch (error) {
    console.error("Update Assignment Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

//  Delete an assignment for a teacher
export const deleteAssignment = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { course, semester } = req.body;

    if (!course || !semester) {
      return res.status(400).json({ message: "Course and semester required" });
    }

    const record = await TeacherAssignmentSchedule.findOne({
      teacher: teacherId,
    });

    if (!record) return res.status(404).json({ message: "Teacher not found" });

    // Remove the assignment
    const originalLength = record.assignments.length;
    record.assignments = record.assignments.filter(
      (a) =>
        !(a.course.toString() === course && a.semester.toString() === semester)
    );

    if (record.assignments.length === originalLength)
      return res.status(404).json({ message: "Assignment not found" });

    await record.save();

    // Populate after save
    await record.populate([
      { path: "assignments.course", select: "name" },
      { path: "assignments.semester", select: "name" },
    ]);

    res
      .status(200)
      .json({ message: "Assignment deleted", assignments: record.assignments });
  } catch (error) {
    console.error("Delete Assignment Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Get courses by department for assignment
export const getCoursesByDepartment = async (req, res) => {
  try {
    const user = await Teacher.findById(req.user.id);
    if (!user || user.role !== "Principal") {
      return res.status(403).json({
        success: false,
        message: "Access denied: only Principal can manage assignments",
      });
    }

    const { departmentId } = req.params;
    if (!departmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Department ID is required" });
    }

    // Populate courses directly from department
    const department = await Department.findById(departmentId)
      .populate("courses", "name courseName _id")
      .lean();

    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    return res.status(200).json({ success: true, courses: department.courses });
  } catch (error) {
    console.error("Error fetching courses by department:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

// Get subjects by course and semester for assignment
export const getSubjectsByCourseAndSemester = async (req, res) => {
  try {
    const user = await Teacher.findById(req.user.id);
    if (!user || user.role !== "Principal") {
      return res.status(403).json({
        success: false,
        message: "Access denied: only Principal can manage assignments",
      });
    }

    const { courseId, semesterId } = req.params;
    if (!courseId || !semesterId) {
      return res.status(400).json({
        success: false,
        message: "Course ID and Semester ID are required",
      });
    }

    const subjects = await Subject.find({
      course: courseId,
      semester: semesterId,
    })
      .select("name _id")
      .lean();

    return res.status(200).json({ success: true, subjects });
  } catch (error) {
    console.error("Error fetching subjects by course and semester:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

export const getAssignedTeachersByCourse = async (req, res) => {
  try {
    const user = await Teacher.findById(req.user.id);
    if (!user || user.role !== "Principal") {
      return res.status(403).json({
        success: false,
        message: "Access denied: only Principal can view assigned teachers",
      });
    }

    const { course, semester } = req.query;
    if (!course || !semester) {
      return res
        .status(400)
        .json({ success: false, message: "Course and semester are required" });
    }

    // Find teachers assigned to the specified course and semester
    const assignedTeachers = await TeacherAssignmentSchedule.find({
      assignments: {
        $elemMatch: { course, semester },
      },
    })
      .populate("teacher", "name employee_id")
      .lean();

    const result = assignedTeachers.map((record) => ({
      teacher: record.teacher,
      assignments: record.assignments
        .filter(
          (a) =>
            a.course.toString() === course && a.semester.toString() === semester
        )
        .map((a) => ({
          course: a.course,
          semester: a.semester,
        })),
    }));

    return res.status(200).json({ success: true, teachers: result });
  } catch (error) {
    console.error("Error fetching assigned teachers:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
