import TeacherAssignmentSchedule from "../../model/teachers/assign.model.js";

//  Add a schedule entry for a teacher
export const addSchedule = async (req, res) => {
  try {
    const { teacherId, day, course, semester, subject, time } = req.body;

    if (!teacherId || !day || !course || !semester || !subject || !time) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find teacher record
    let record = await TeacherAssignmentSchedule.findOne({
      teacher: teacherId,
    });

    if (!record) {
      // No record yet, create with this schedule
      record = new TeacherAssignmentSchedule({
        teacher: teacherId,
        schedule: [{ day, contents: [{ course, semester, subject, time }] }],
      });
      await record.save();
    } else {
      // Check if the day exists
      let dayEntry = record.schedule.find((d) => d.day === day);

      if (!dayEntry) {
        // Add new day with contents
        record.schedule.push({
          day,
          contents: [{ course, semester, subject, time }],
        });
      } else {
        // Check for duplicate time in the same day
        const duplicate = dayEntry.contents.some((c) => c.time === time);
        if (duplicate) {
          return res.status(400).json({
            message: `A class is already scheduled at ${time} on ${day}`,
          });
        }

        // Add new content
        dayEntry.contents.push({ course, semester, subject, time });
      }

      await record.save();
    }

    // Populate the fields
    await record.populate([
      { path: "schedule.contents.course", select: "name" },
      { path: "schedule.contents.semester", select: "name" },
      { path: "schedule.contents.subject", select: "name" },
    ]);

    res
      .status(200)
      .json({ message: "Schedule added", schedule: record.schedule });
  } catch (error) {
    console.error("Add Schedule Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

//  Get all schedules for all teachers
export const getAllSchedules = async (req, res) => {
  try {
    const records = await TeacherAssignmentSchedule.find()
      .populate("teacher", "name email")
      .populate("schedule.contents.course", "name")
      .populate("schedule.contents.semester", "name")
      .populate("schedule.contents.subject", "name");

    res
      .status(200)
      .json(records.map((r) => ({ teacher: r.teacher, schedule: r.schedule })));
  } catch (error) {
    console.error("Get All Schedules Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// //  Get schedule for a single teacher
// export const getTeacherSchedule = async (req, res) => {
//   try {
//     const { teacherId } = req.params;

//     const record = await TeacherAssignmentSchedule.findOne({
//       teacher: teacherId,
//     })
//       .populate("schedule.contents.course", "name")
//       .populate("schedule.contents.semester", "name")
//       .populate("schedule.contents.subject", "name");

//     if (!record) return res.status(404).json({ message: "Schedule not found" });

//     res.status(200).json({ teacher: teacherId, schedule: record.schedule });
//   } catch (error) {
//     console.error("Get Teacher Schedule Error:", error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// };

//  Update a schedule entry
export const updateSchedule = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const {
      day,
      oldCourse,
      oldSemester,
      oldSubject,
      newCourse,
      newSemester,
      newSubject,
      newTime,
    } = req.body;

    if (
      !day ||
      !oldCourse ||
      !oldSemester ||
      !oldSubject ||
      !newCourse ||
      !newSemester ||
      !newSubject ||
      !newTime
    ) {
      return res
        .status(400)
        .json({ message: "All fields required for update" });
    }

    const record = await TeacherAssignmentSchedule.findOne({
      teacher: teacherId,
    });
    if (!record) return res.status(404).json({ message: "Teacher not found" });

    // Find the day
    const dayEntry = record.schedule.find((d) => d.day === day);
    if (!dayEntry)
      return res.status(404).json({ message: "Day not found in schedule" });

    // Check if the new time conflicts with existing entries (except the one being updated)
    const conflict = dayEntry.contents.some(
      (c) =>
        c.time === newTime &&
        !(
          c.course.toString() === oldCourse &&
          c.semester.toString() === oldSemester &&
          c.subject.toString() === oldSubject
        )
    );
    if (conflict) {
      return res.status(400).json({
        message: `Time conflict: another class is already scheduled at ${newTime} on ${day}`,
      });
    }

    // Find the specific schedule entry to update
    const contentEntry = dayEntry.contents.find(
      (c) =>
        c.course.toString() === oldCourse &&
        c.semester.toString() === oldSemester &&
        c.subject.toString() === oldSubject
    );
    if (!contentEntry)
      return res.status(404).json({ message: "Schedule entry not found" });

    // Update values
    contentEntry.course = newCourse;
    contentEntry.semester = newSemester;
    contentEntry.subject = newSubject;
    contentEntry.time = newTime;

    await record.save();

    // Populate
    await record.populate([
      { path: "schedule.contents.course", select: "name" },
      { path: "schedule.contents.semester", select: "name" },
      { path: "schedule.contents.subject", select: "name" },
    ]);

    res
      .status(200)
      .json({ message: "Schedule updated", schedule: record.schedule });
  } catch (error) {
    console.error("Update Schedule Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

//  Delete a schedule entry
export const deleteSchedule = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { day, course, semester, subject } = req.body;

    if (!day || !course || !semester || !subject) {
      return res
        .status(400)
        .json({ message: "All fields required for deletion" });
    }

    const record = await TeacherAssignmentSchedule.findOne({
      teacher: teacherId,
    });
    if (!record) return res.status(404).json({ message: "Teacher not found" });

    // Find the day
    const dayEntry = record.schedule.find((d) => d.day === day);
    if (!dayEntry)
      return res.status(404).json({ message: "Day not found in schedule" });

    // Remove the specific schedule entry
    const initialLength = dayEntry.contents.length;
    dayEntry.contents = dayEntry.contents.filter(
      (c) =>
        !(
          c.course.toString() === course &&
          c.semester.toString() === semester &&
          c.subject.toString() === subject
        )
    );

    if (dayEntry.contents.length === initialLength) {
      return res.status(404).json({ message: "Schedule entry not found" });
    }

    // If no more contents in the day, remove the day
    if (dayEntry.contents.length === 0) {
      record.schedule = record.schedule.filter((d) => d.day !== day);
    }

    await record.save();

    // Populate
    await record.populate([
      { path: "schedule.contents.course", select: "name" },
      { path: "schedule.contents.semester", select: "name" },
      { path: "schedule.contents.subject", select: "name" },
    ]);

    res
      .status(200)
      .json({ message: "Schedule entry deleted", schedule: record.schedule });
  } catch (error) {
    console.error("Delete Schedule Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
