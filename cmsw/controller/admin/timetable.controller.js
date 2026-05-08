import TimetableModel from "../../model/student/Timetable.model.js";
import Subject from "../../model/student/subjects.model.js";
import TeacherAssignmentSchedule from "../../model/teachers/assign.model.js";
// 🔹 helper: generate unique 6-digit period_id
const generatePeriodId = async () => {
  let unique = false;
  let id;
  while (!unique) {
    id = Math.floor(100000 + Math.random() * 900000);
    const exists = await TimetableModel.findOne({ "days.time.period_id": id });
    if (!exists) unique = true;
  }
  return id;
};

// 🔹 assign missing period_ids before saving
const assignPeriodIds = async (days) => {
  for (const day of days) {
    for (const period of day.time) {
      if (!period.period_id) {
        period.period_id = await generatePeriodId();
      }
    }
  }
};

// 🔹 convert HH:MM to minutes
const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// 🔹 check duplicates and overlaps in days
const validatePeriods = (days) => {
  for (const day of days) {
    const seen = new Set();
    const intervals = [];

    for (const period of day.time) {
      if (!period.subject || !period.start || !period.end) {
        return {
          valid: false,
          message: `Each period in ${day.day} must have subject, start, and end`,
        };
      }

      // exact duplicate key: same subject + same time
      const key = `${day.day}-${period.subject}-${period.start}-${period.end}`;
      if (seen.has(key)) {
        return {
          valid: false,
          message: `Duplicate found on ${day.day}: subject already assigned at ${period.start}-${period.end}`,
        };
      }
      seen.add(key);

      // overlap check
      const startMin = timeToMinutes(period.start);
      const endMin = timeToMinutes(period.end);
      if (startMin >= endMin) {
        return {
          valid: false,
          message: `Invalid time in ${day.day}: start must be before end (${period.start} - ${period.end})`,
        };
      }
      intervals.push({
        start: startMin,
        end: endMin,
        raw: `${period.start}-${period.end}`,
      });
    }

    // check intervals for overlap
    intervals.sort((a, b) => a.start - b.start);
    for (let i = 1; i < intervals.length; i++) {
      if (intervals[i].start < intervals[i - 1].end) {
        return {
          valid: false,
          message: `Time overlap on ${day.day}: ${
            intervals[i - 1].raw
          } overlaps with ${intervals[i].raw}`,
        };
      }
    }
  }
  return { valid: true };
};

//  Add or update timetable (upsert)
export const addOrUpdateTimeTable = async (req, res) => {
  try {
    const { course, semster, days } = req.body;

    if (!course || !semster || !days) {
      return res.status(400).json({
        success: false,
        message: "course, semster and days are required",
      });
    }

    // validate duplicates & overlaps within the request
    const validation = validatePeriods(days);
    if (!validation.valid) {
      return res
        .status(400)
        .json({ success: false, message: validation.message });
    }

    await assignPeriodIds(days);

    // check if timetable already exists
    let timetable = await TimetableModel.findOne({ course, semster });

    if (timetable) {
      // merge new days and periods but prevent duplicates
      for (const newDay of days) {
        const existingDay = timetable.days.find((d) => d.day === newDay.day);

        if (existingDay) {
          for (const newPeriod of newDay.time) {
            // check if same subject and time already exists
            const isDuplicate = existingDay.time.some(
              (p) =>
                p.subject.toString() === newPeriod.subject.toString() &&
                p.start === newPeriod.start &&
                p.end === newPeriod.end
            );
            if (!isDuplicate) {
              existingDay.time.push(newPeriod);
            }
          }
        } else {
          timetable.days.push(newDay);
        }
      }

      await timetable.save();
      return res.status(200).json({
        success: true,
        message: "Timetable updated successfully",
      });
    } else {
      // create new timetable
      timetable = new TimetableModel({ course, semster, days });
      await timetable.save();
      return res.status(201).json({
        success: true,
        message: "Timetable created successfully",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Get all timetables
export const getAllTimeTables = async (req, res) => {
  try {
    const timetables = await TimetableModel.find()
      .populate("course")
      .populate("semster")
      .populate("days.time.subject");

    res.status(200).json({ success: true, data: timetables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Delete timetable by ID
export const deleteTimeTable = async (req, res) => {
  try {
    const { id } = req.params;

    const timetable = await TimetableModel.findByIdAndDelete(id);

    if (!timetable) {
      return res
        .status(404)
        .json({ success: false, message: "Timetable not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Timetable deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubjectsByCourseAndSemester = async (req, res) => {
  try {
    const { courseId, semesterId } = req.params;

    if (!courseId || !semesterId) {
      return res.status(400).json({
        success: false,
        message: "courseId and semesterId are required",
      });
    }

    const subjects = await Subject.find({
      course: courseId,
      semester: semesterId,
    }).select("_id name image");

    if (!subjects || subjects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No subjects found for this course and semester",
      });
    }

    res.status(200).json({ success: true, subjects });
  } catch (error) {
    console.error("❌ Error fetching subjects:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeachersByCourseAndSemester = async (req, res) => {
  try {
    let courseId = req.params.courseId || req.query.courseId;
    let semesterId = req.params.semesterId || req.query.semesterId;

    if (!courseId || !semesterId) {
      return res.status(400).json({
        success: false,
        message: "courseId and semesterId are required",
      });
    }

    // 🔹 Find all teacher assignments that match course + semester
    const assignments = await TeacherAssignmentSchedule.find({
      assignments: {
        $elemMatch: {
          course: courseId,
          semester: semesterId,
        },
      },
    }).populate({
      path: "teacher",
      select: "_id name",
    });

    // 🔹 Extract unique teachers
    const teachers = assignments
      .map((a) => a.teacher)
      .filter((t) => t)
      .reduce((acc, curr) => {
        if (!acc.some((t) => t._id.toString() === curr._id.toString())) {
          acc.push(curr);
        }
        return acc;
      }, []);

    if (teachers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No teachers found for this course and semester",
      });
    }

    res.status(200).json({ success: true, teachers });
  } catch (error) {
    console.error("❌ Error fetching teachers:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
