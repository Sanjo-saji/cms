import Student from "../../model/student/student.model.js";
import Teacher from "../../model/teachers/teachers.model.js";
import Event from "../../model/events/events.model.js";
import AttendanceSchema from "../../model/student/attendance.model.js";
import AttendanceTimeSchema from "../../model/teachers/attendancetime.model.js";
import Messages from "../../model/student/message.model.js";
import "../../model/course/course.model.js";
import "../../model/semester/semesters.model.js";
import TeacherAssignmentSchedule from "../../model/teachers/assign.model.js";
import TimetableModel from "../../model/student/Timetable.model.js";
import mongoose from "mongoose";

export const getAssign = async (req, res) => {
  try {
    const teacherId = req.user.id;
    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }

    //  Fetch teacher assignments in one go
    const teacherData = await TeacherAssignmentSchedule.findOne({
      teacher: teacherId,
    })
      .populate({
        path: "assignments.course",
        select: "name _id",
        model: "courses",
      })
      .populate({
        path: "assignments.semester",
        select: "name _id",
        model: "semesters",
      });

    if (!teacherData || teacherData.assignments.length === 0) {
      return res.status(404).json({ message: "Assignments not found" });
    }

    //  Format assignments
    const formattedAssignments = teacherData.assignments.map((assignItem) => ({
      courseId: assignItem.course?._id?.toString() || null,
      courseName: assignItem.course?.name || "Unknown course",
      semesterId: assignItem.semester?._id?.toString() || null,
      semesterName: assignItem.semester?.name || "Unknown semester",
    }));

    //  Remove duplicates
    const uniqueAssignments = [
      ...new Map(
        formattedAssignments.map((item) => [
          `${item.courseId}-${item.semesterId}`,
          item,
        ])
      ).values(),
    ];

    res.status(200).json({ assignments: uniqueAssignments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const { course, semster } = req;
    const today = new Date().toISOString().split("T")[0];
    await Event.deleteMany({ deleteOnDate: { $lte: today } });
    // Get events for this course + semester
    const events = await Event.find({ course, semster });
    if (!events) {
      return res.status(200).json({ count: 0, events: [] });
    }
    const filteredEvents = events.map((event) => ({
      id: event._id,
      title: event.title,
      content: event.message,
      image: event.image,
    }));
    res.status(200).json({
      count: filteredEvents.length,
      events: filteredEvents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventsByTeacher = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { course, semster } = req;

    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const events = await Event.find({ teacher: teacherId, course, semster });
    if (!events) {
      return res.status(404).json({ count: 0, events: [] });
    }

    const formatted = events.map((event) => ({
      id: event._id,
      title: event.title,
      description: event.message,
      del_on: event.deleteOnDate,
      image: event.image,
    }));

    res.status(200).json({
      message: "Events retrieved successfully",
      teacher: {
        id: teacher._id,
        name: teacher.name,
        department: teacher.Department,
      },
      events: formatted,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addEvent = async (req, res) => {
  try {
    // Extract all required fields from req.body
    const { title, message, course, semster, deleteOnDate } = req.body;
    const teacherId = req.user.id;
    // Validate required fields
    if (
      !title?.trim() ||
      !message?.trim() ||
      !teacherId ||
      !course ||
      !semster ||
      !deleteOnDate
    ) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["title", "message", "course", "semster", "deleteOnDate"],
      });
    }

    // Image URL handling
    const imageUrl = req.file
      ? `http://miserably-arriving-adder.ngrok-free.app/images/${req.file.filename}`
      : null;

    // Create new event
    const newEvent = new Event({
      title: title.trim(),
      message: message.trim(),
      image: imageUrl,
      course,
      semster,
      teacher: teacherId,
      date: new Date().toISOString().split("T")[0],
      deleteOnDate,
    });

    await newEvent.save();

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    console.error("Add Event Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, message, deleteOnDate, course, semster } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.title = title.trim();
    event.message = message.trim();
    event.course = course || event.course;
    event.semster = semster || event.semster;
    event.deleteOnDate = deleteOnDate || event.deleteOnDate;

    if (req.file) {
      event.image = `http://miserably-arriving-adder.ngrok-free.app/images/${req.file.filename}`;
    }

    await event.save();

    res.status(200).json({ message: "Event updated successfully", event });
  } catch (error) {
    console.error("Update Event Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonthlyAttendance = async (req, res) => {
  try {
    const courseId = req.course;
    const semsterId = req.semster;

    const students = await Student.find({
      course: courseId,
      semester: semsterId,
    });

    const studentIds = students.map((s) => s._id);

    const attendances = await AttendanceSchema.find({
      studentId: { $in: studentIds },
    });

    const monthly = {};

    attendances.forEach((entry) => {
      entry.attendance.forEach((day) => {
        const month = new Date(day.date).toLocaleString("default", {
          month: "short",
        }); // e.g., "Apr"
        if (!monthly[month]) {
          monthly[month] = { present: 0, total: 0 };
        }
        day.slots.forEach((slot) => {
          monthly[month].total++;
          if (slot.status === "present") {
            monthly[month].present++;
          }
        });
      });
    });

    const labels = Object.keys(monthly).sort(
      (a, b) => new Date(`${a} 1, 2025`) - new Date(`${b} 1, 2025`)
    );

    const values = labels.map((month) =>
      monthly[month].total > 0
        ? (monthly[month].present / monthly[month].total) * 100
        : 0
    );

    //  If only one month exists, add next month with 0%
    if (labels.length === 1) {
      const monthOrder = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const currentIndex = monthOrder.indexOf(labels[0]);
      const nextMonth = monthOrder[(currentIndex + 1) % 12];
      labels.push(nextMonth);
      values.push(0);
    }

    res.json({
      labels,
      data: values,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStudentAttendanceReport = async (req, res) => {
  try {
    const course = req.course;
    const semester = req.semster;

    // 1. Get students for the selected course and semester
    const students = await Student.find({ course, semester }, "_id name");

    const studentIds = students.map((s) => s._id);

    // 2. Get attendance records for those students
    const attendances = await AttendanceSchema.find({
      studentId: { $in: studentIds }, // FIX: Query using the correct 'studentId' field
    })
      .populate("studentId", "name") // FIX: Populate the 'studentId' path
      .populate("attendance.slots.subject", "name");

    // 3. Build a map of studentId to their attendance record for efficient lookup
    const attendanceMap = new Map();
    attendances.forEach((record) => {
      // FIX: Add a check to prevent crashes if a student record was deleted
      if (record.studentId && record.studentId._id) {
        attendanceMap.set(record.studentId._id.toString(), record);
      }
    });

    // 4. Prepare the final report for each student
    const result = students.map((student) => {
      const record = attendanceMap.get(student._id.toString());

      if (record) {
        let total = 0;
        let present = 0;

        const attendanceByDate = record.attendance.map((entry) => {
          // FIX: Create an array of periods to handle multiple classes of the same subject
          const periods = [];
          for (const slot of entry.slots) {
            const subjectName = slot.subject?.name || "Unknown";
            periods.push({
              subject: subjectName,
              status: slot.status,
            });

            // Calculate totals for the percentage
            total++;
            if (slot.status === "present") {
              present++;
            }
          }

          const dateObj = new Date(entry.date);
          const yyyy = dateObj.getFullYear();
          const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
          const dd = String(dateObj.getDate()).padStart(2, "0");
          const formattedDate = `${yyyy}-${mm}-${dd}`;

          return {
            date: formattedDate,
            periods, // Use the new 'periods' array
          };
        });

        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        return {
          name: student.name,
          _id: student._id,
          percentage,
          attendance: attendanceByDate,
        };
      } else {
        // Handle students who are in the class but have no attendance records yet
        return {
          name: student.name,
          _id: student._id,
          percentage: 0,
          attendance: [],
        };
      }
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Error generating student attendance report:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

export const getSchedule = async (req, res) => {
  try {
    const teacherId = req.user.id;
    if (!teacherId) {
      return res.status(400).json({ message: "Invalid teacher ID" });
    }

    //  Fetch teacher's schedule
    const teacherData = await TeacherAssignmentSchedule.findOne({
      teacher: teacherId,
    })
      .populate("schedule.contents.course", "name")
      .populate("schedule.contents.semester", "name")
      .populate("schedule.contents.subject", "name");

    if (!teacherData || teacherData.schedule.length === 0) {
      return res
        .status(404)
        .json({ message: "Schedule not found for this teacher" });
    }

    //  Format response
    const formattedSchedule = teacherData.schedule.map((dayItem) => ({
      day: dayItem.day,
      contents: dayItem.contents.map((c) => ({
        course: c.course?._id
          ? { id: c.course._id.toString(), name: c.course.name }
          : { id: null, name: "Unknown" },
        semester: c.semester?._id
          ? { id: c.semester._id.toString(), name: c.semester.name }
          : { id: null, name: "Unknown" },
        subject: c.subject?._id
          ? { id: c.subject._id.toString(), name: c.subject.name }
          : { id: null, name: "Unknown" },
        time: c.time,
      })),
    }));

    res.status(200).json({
      teacher: teacherData.teacher,
      schedule: formattedSchedule,
    });
  } catch (error) {
    console.error("Schedule Error:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getStudentNamesAsc = async (req, res) => {
  try {
    const courseId = req.course;
    const semsterId = req.semster;

    const baseUrl = "http://miserably-arriving-adder.ngrok-free.app";

    const students = await Student.find({
      course: courseId,
      semester: semsterId,
    })
      .sort({ name: 1 })
      // Mongoose includes _id by default, but it's good practice to be explicit
      .select("_id name register admission phone DOB image");

    const formattedStudents = students.map((student) => {
      return {
        _id: student._id, // Add the _id field here
        name: student.name,
        register: student.register,
        admission: student.admission,
        phone: student.phone,
        DOB: student.DOB,
        image: student.image
          ? `${baseUrl}/uploads/students/${student.image}`
          : null,
      };
    });

    res.status(200).json(formattedStudents);
  } catch (err) {
    console.error("Fetch student names error:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

export const submitAttendance = async (req, res) => {
  try {
    const { date, time, period_id, students } = req.body;
    const course = (req.query?.course || req.body?.course)?.trim?.();
    const semster = (req.query?.semster || req.body?.semster)?.trim?.();
    const teacher = req.user?.id;

    // Basic validation
    if (!date || !time || !period_id || !teacher || !Array.isArray(students)) {
      return res
        .status(400)
        .json({ message: "Missing or invalid required fields" });
    }

    // Step 1: AttendanceTimeSchema — store period submission history
    let attdenceTime = await AttendanceTimeSchema.findOne({
      "slote.course": course,
      "slote.semster": semster,
    });

    if (!attdenceTime) {
      // If not found, create new schema
      attdenceTime = new AttendanceTimeSchema({
        slote: [
          {
            course,
            semster,
            attendance: [
              {
                date,
                submit: [
                  {
                    period: period_id,
                    teacher,
                    time,
                    completed: true,
                  },
                ],
              },
            ],
          },
        ],
      });
    } else {
      // Append to existing attendance record
      const slote = attdenceTime.slote[0];
      let dayAttendance = slote.attendance.find((a) => a.date === date);

      if (!dayAttendance) {
        // Add new date
        const newAttendance = {
          date,
          submit: [
            {
              period: period_id,
              teacher,
              time,
              completed: true,
            },
          ],
        };
        slote.attendance.push(newAttendance);
      } else {
        // Check if already submitted
        const alreadySubmitted = dayAttendance.submit?.find(
          (s) => s.period === period_id
        );

        if (alreadySubmitted) {
          return res
            .status(400)
            .json({ message: "Attendance already submitted" });
        }

        if (!Array.isArray(dayAttendance.submit)) {
          dayAttendance.submit = [];
        }

        dayAttendance.submit.push({
          period: period_id,
          teacher,
          time,
          completed: true,
        });
      }
    }

    await attdenceTime.save();

    const timetable = await TimetableModel.findOne({
      "days.time.period_id": Number(period_id),
    });

    let subjectId = null;

    if (timetable) {
      const slot = timetable.days
        .flatMap((day) => day.time)
        .find((slot) => slot.period_id === Number(period_id));

      if (slot) {
        subjectId = slot.subject;
      }
    }

    if (!subjectId) {
      return res.status(400).json({
        message: "Subject not found for this period",
      });
    }

    // Step 3: Save attendance per student
    for (const { student, status } of students) {
      let studentDoc = await AttendanceSchema.findOne({
        studentId: student,
        semester: semster,
      });

      if (!studentDoc) {
        studentDoc = new AttendanceSchema({
          studentId: student,
          semester: semster,
          attendance: [],
        });
      }

      const formattedDate = new Date(date).toISOString().split("T")[0];
      let daily = studentDoc.attendance.find(
        (a) => new Date(a.date).toISOString().split("T")[0] === formattedDate
      );

      if (!daily) {
        studentDoc.attendance.push({
          date: new Date(date),
          slots: [{ subject: subjectId, status }],
        });
      } else {
        daily.slots.push({ subject: subjectId, status });
      }

      await studentDoc.save();
    }

    return res
      .status(201)
      .json({ message: "Attendance submitted successfully" });
  } catch (error) {
    console.error("Submit attendance error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getmessage = async (req, res) => {
  try {
    const courseId = req.course;
    const semsterId = req.semster;
    if (!courseId || !semsterId) {
      return res.status(400).json({ message: "Invalid course or semester ID" });
    }
    const messages = await Messages.find({
      semesterId: semsterId,
      courseId,
    }).populate("sender");

    if (!messages) {
      return res
        .status(404)
        .json({ message: "No notifications i cant find any" });
    }
    if (messages.length === 0) {
      return res
        .status(404)
        .json({ message: "No notifications i cant find any" });
    }
    const msg = messages.map((m) => ({
      id: m._id,
      heading: m.Heading,
      content: m.content,
      date: m.date,
      sender: m.sender?.name || "Unknown",
    }));
    res.status(200).json({
      msg,
    });
  } catch (error) {
    console.error("Error in getNotifications controller:", error);
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

export const getmessage_t = async (req, res) => {
  try {
    const teacher = req.user.id;
    const courseId = req.course;
    const semsterId = req.semster;
    if (!courseId || !semsterId) {
      return res.status(400).json({ message: "Invalid course or semester ID" });
    }
    const messages = await Messages.find({
      sender: teacher,
      semesterId: semsterId,
      courseId,
    }).populate("sender");

    if (!messages) {
      return res
        .status(404)
        .json({ message: "No notifications i cant find any" });
    }
    if (messages.length === 0) {
      return res
        .status(404)
        .json({ message: "No notifications i cant find any" });
    }
    const msg = messages.map((m) => ({
      id: m._id,
      heading: m.Heading,
      content: m.content,
      date: m.date,
      sender: m.sender?.name || "Unknown",
    }));
    res.status(200).json({
      msg,
    });
  } catch (error) {
    console.error("Error in getNotifications controller:", error);
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

export const addMessage_t = async (req, res) => {
  try {
    const sender = req.user.id;
    const courseId = req.course;
    const semesterId = req.semster;
    const { Heading, content } = req.body;

    if (!Heading || !content) {
      return res
        .status(400)
        .json({ message: "Heading and content are required" });
    }
    const formattedDate = new Date().toISOString().split("T")[0];
    const newMessage = new Messages({
      sender,
      courseId,
      semesterId,
      Heading,
      content,
      date: formattedDate,
    });

    await newMessage.save();

    res.status(201).json({
      message: "Message added successfully",
      newMessage,
    });
  } catch (error) {
    console.error("Error in addMessage_t controller:", error);
    res.status(500).json({
      message: "Failed to add message",
      error: error.message,
    });
  }
};

export const updateMessage = async (req, res) => {
  try {
    const teacher = req.user.id;
    const messageId = req.params.id;
    const { heading, content } = req.body;

    // Basic validation
    if (!heading && !content) {
      return res.status(400).json({ message: "Invalid input data" });
    }
    // Find the message and make sure the sender is the same teacher
    const message = await Messages.findOne({ _id: messageId, sender: teacher });

    if (!message) {
      return res
        .status(404)
        .json({ message: "Message not found or access denied" });
    }

    // Update fields
    if (heading) message.Heading = heading;
    if (content) message.content = content;
    const formattedDate = new Date().toISOString().split("T")[0];
    message.date = formattedDate;

    await message.save();

    res.status(200).json({
      message: "Message updated successfully",
      updatedMessage: {
        id: message._id,
        heading: message.Heading,
        content: message.content,
        date: message.date,
      },
    });
  } catch (error) {
    console.error("Error in updateMessage controller:", error);
    res.status(500).json({
      message: "Failed to update message",
      error: error.message,
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const teacher = req.user.id;
    const messageId = req.params.id;

    const message = await Messages.findOne({ _id: messageId, sender: teacher });

    if (!message) {
      return res
        .status(404)
        .json({ message: "Message not found or access denied" });
    }

    await Messages.deleteOne({ _id: messageId });

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessage controller:", error);
    res.status(500).json({
      message: "Failed to delete message",
      error: error.message,
    });
  }
};

export const getPeriod = async (req, res) => {
  try {
    const courseId = req.course; // set in middleware
    const semesterId = req.semster; // set in middleware
    const teacherId = req.user?.id;

    // Step 1: Get current date & weekday
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0]; // "YYYY-MM-DD"

    const dayMap = {
      sun: "Sunday",
      mon: "Monday",
      tue: "Tuesday",
      wed: "Wednesday",
      thu: "Thursday",
      fri: "Friday",
      sat: "Saturday",
    };

    const currentDayShort = today
      .toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "Asia/Kolkata",
      })
      .toLowerCase(); // "mon", "tue", ...
    const currentDay = dayMap[currentDayShort];

    // Step 2: Weekend check
    if (["Saturday", "Sunday"].includes(currentDay)) {
      return res.status(200).json({
        day: currentDay,
        date: todayDate,
        periods: [],
        message: `Today is ${currentDay}. No classes.`,
      });
    }

    // Step 3: Fetch timetable for course & semester
    const timetable = await TimetableModel.findOne({
      course: courseId,
      semster: semesterId,
    }).populate("days.time.subject");

    if (!timetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    const todayPeriod = timetable.days.find((d) => d.day === currentDay);

    if (!todayPeriod) {
      return res.status(200).json({
        day: currentDay,
        date: todayDate,
        periods: [],
        message: "No periods today",
      });
    }

    // Step 4: Check if attendance already submitted
    const attendanceRecord = await AttendanceTimeSchema.findOne({
      "slote.course": courseId,
      "slote.semster": semesterId,
    });

    let submittedPeriods = [];

    if (attendanceRecord) {
      const slote = attendanceRecord.slote[0];
      const todayAttendance = slote.attendance.find(
        (a) => a.date === todayDate
      );
      if (todayAttendance) {
        submittedPeriods = todayAttendance.submit.map((entry) => entry.period);
      }
    }

    // Step 5: Prepare periods with submitted status
    const periodsWithStatus = todayPeriod.time.map((period) => ({
      period_id: period.period_id,
      //      subject: period.subject,
      start: period.start,
      end: period.end,
      submitted: submittedPeriods.includes(period.period_id),
    }));

    // Step 6: Send response
    return res.status(200).json({
      day: currentDay,
      date: todayDate,
      periods: periodsWithStatus,
      message: "Success",
    });
  } catch (error) {
    console.error("Error in getPeriod:", error);
    res.status(500).json({
      message: "Failed to get today's periods",
      error: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const teacherId = req.user.id;
    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }

    // Use .select() to specify exactly which fields to fetch for efficiency
    const teacher = await Teacher.findById(teacherId)
      .select("employee_id name role department image phone") // Specify fields here
      .populate("department", "name");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const baseUrl = "http://miserably-arriving-adder.ngrok-free.app";

    // The response now only contains the selected fields
    return res.status(200).json({
      employeeId: teacher.employee_id,
      name: teacher.name,
      role: teacher.role,
      phone: teacher.phone, // Include the phone number
      department: teacher.department ? teacher.department.name : null,
      image: teacher.image
        ? `${baseUrl}/uploads/teachers/${teacher.image}`
        : null,
    });
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTeachersByCourseAndSemester = async (req, res) => {
  try {
    let courseId = req.course || req.query.courseId || req.query.course;
    let semesterId = req.semster || req.query.semesterId || req.query.semster;

    // If not provided, and user is a student, fetch from student profile
    if ((!courseId || !semesterId) && req.user && req.user.id) {
      const student = await Student.findById(req.user.id).lean();
      if (student) {
        if (!courseId && student.course) courseId = student.course.toString();
        if (!semesterId && student.semester)
          semesterId = student.semester.toString();
      }
    }

    if (!courseId || !semesterId) {
      return res
        .status(400)
        .json({ message: "courseId and semesterId are required" });
    }

    // 🔹 Use TeacherAssignmentSchedule instead of Assignment
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

    // Extract unique teachers
    const teachers = assignments
      .map((a) => a.teacher)
      .filter((t) => t)
      .reduce((acc, curr) => {
        if (!acc.some((t) => t._id.toString() === curr._id.toString())) {
          acc.push(curr);
        }
        return acc;
      }, []);

    res.status(200).json({ teachers });
  } catch (error) {
    console.error("❌ Error fetching teachers:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getMyScheduledSubjects = async (req, res) => {
  try {
    // 1. Get the teacher's ID from the authenticated user object.
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res
        .status(401)
        .json({ message: "Authentication error: User ID not found." });
    }

    // 2. Build and execute the aggregation pipeline.
    const pipeline = [
      // Find the teacher's specific schedule document
      { $match: { teacher: new mongoose.Types.ObjectId(teacherId) } },
      // Unwind the schedule and contents arrays to process each class entry
      { $unwind: "$schedule" },
      { $unwind: "$schedule.contents" },
      // Group by subject ID to get unique subjects
      { $group: { _id: "$schedule.contents.subject" } },
      // Look up the subject details from the 'subjects' collection
      {
        $lookup: {
          from: "subjects", // The actual name of your subjects collection
          localField: "_id",
          foreignField: "_id",
          as: "subjectDetails",
        },
      },
      // Unwind the resulting subjectDetails array
      { $unwind: "$subjectDetails" },
      // Reshape the output to include only the subject's _id and name
      {
        $project: {
          _id: "$subjectDetails._id",
          name: "$subjectDetails.name",
        },
      },
    ];

    const subjects = await TeacherAssignmentSchedule.aggregate(pipeline);

    // 3. Send the response.
    if (!subjects || subjects.length === 0) {
      return res
        .status(404)
        .json({ message: "No scheduled subjects found for this teacher." });
    }

    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching scheduled subjects:", error);
    res.status(500).json({ message: "Server error while fetching subjects." });
  }
};
