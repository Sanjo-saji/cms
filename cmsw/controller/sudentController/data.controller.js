import Student from "../../model/student/student.model.js";
import Event from "../../model/events/events.model.js";
import AttendanceSchema from "../../model/student/attendance.model.js";
import "../../model/semester/semesters.model.js";
import Subject from "../../model/student/subjects.model.js";
import Messages from "../../model/student/message.model.js";
import "../../model/teachers/teachers.model.js";
import "../../model/course/course.model.js";
import Marks from "../../model/student/marks.model.js";
import StudentOtp from "../../model/library/otp.model.js";
import Checkout from "../../model/library/checkout.model.js";
import axios from "axios";

export const getEvents = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findById(studentId).populate("semester");
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        error: `No student found with ID: ${studentId}`,
      });
    }

    if (!student.semester) {
      return res.status(400).json({
        message: "Student has no assigned semester",
        studentInfo: {
          id: student._id,
          name: student.name,
          register: student.register,
        },
      });
    }
    const events = await Event.find({
      semster: student.semester._id,
      course: student.course,
    });
    if (!events || events.length === 0) {
      return res.status(200).json({
        message: "No events",
        events: [],
      });
    }
    const today = new Date().toISOString().split("T")[0];
    await Event.deleteMany({
      semster: student.semester._id,
      course: student.course,
      deleteOnDate: { $lte: today },
    });
    const remainingEvents = await Event.find({
      semster: student.semester._id,
      course: student.course,
    });
    const filteredEvents = remainingEvents.map((event) => ({
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
    console.error("Error in Events controller:", error);
    res.status(500).json({
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};

export const getAttendancePercentage = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Get student with semester
    const student = await Student.findById(studentId).populate("semester");
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
        error: `No student found with ID: ${studentId}`,
      });
    }

    // 2. Find attendance record for student + semester
    const record = await AttendanceSchema.findOne({
      studentId: studentId,
      semester: student.semester._id,
    }).lean();

    // 3. If no record → return default response
    if (!record || !record.attendance?.length) {
      return res.status(200).json({
        message: "Attendance percentage fetched successfully",
        total: 0,
        present: 0,
        percentage: 0,
      });
    }

    const totalDays = record.attendance.length;

    //  Decide how to count "present day"
    // Here: student is present if at least ONE slot that day is "present"
    const presentDays = record.attendance.reduce((count, day) => {
      const hasPresent = (day.slots || []).some(
        (slot) => slot.status === "present"
      );
      return count + (hasPresent ? 1 : 0);
    }, 0);

    const percentage =
      totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    return res.status(200).json({
      message: "Attendance percentage fetched successfully",
      total: totalDays,
      present: presentDays,
      percentage,
    });
  } catch (error) {
    console.error("Error in Attendance controller:", error);
    return res.status(500).json({
      message: "Failed to fetch attendance percentage",
      error: error.message,
    });
  }
};

export const getSubjectWiseAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const baseUrl = "http://miserably-arriving-adder.ngrok-free.app";

    // 1. Fetch student with course + semester
    const student = await Student.findById(studentId)
      .populate("course", "name")
      .populate("semester", "name")
      .lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2. Get all subjects for student's course + semester
    const allSubjects = await Subject.find({
      course: student.course._id,
      semester: student.semester._id,
    })
      .select("name image")
      .lean();

    if (!allSubjects || allSubjects.length === 0) {
      return res.status(200).json({
        message: "No subjects found for this course & semester",
        data: [],
      });
    }

    // 3. Fetch attendance docs for this student
    const attendanceDocs = await AttendanceSchema.find({
      studentId: studentId,
      semester: student.semester._id,
    }).lean();

    // 4. Prepare subject-wise stats
    const subjectStatus = {};

    // initialize all subjects with 0
    for (const subj of allSubjects) {
      subjectStatus[subj._id.toString()] = {
        name: subj.name,
        image: subj.image ? `${baseUrl}/uploads/icons/${subj.image}` : null,
        present: 0,
        absent: 0,
      };
    }

    // if attendance exists → count
    for (const attendanceRecord of attendanceDocs) {
      for (const daily of attendanceRecord.attendance || []) {
        for (const slot of daily.slots || []) {
          const subjectId = slot.subject?.toString();
          if (!subjectId || !subjectStatus[subjectId]) continue;

          if (slot.status === "present") {
            subjectStatus[subjectId].present++;
          } else if (slot.status === "absent") {
            subjectStatus[subjectId].absent++;
          }
        }
      }
    }

    // 5. Calculate percentages
    const result = Object.values(subjectStatus).map((subject) => {
      const total = subject.present + subject.absent;
      const percentage =
        total > 0 ? Math.round((subject.present / total) * 100) : 0;
      return {
        name: subject.name,
        image: subject.image,
        present: subject.present,
        absent: subject.absent,
        percentage,
      };
    });

    res.status(200).json({
      message: "Subject-wise attendance fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in SubjectWiseAttendance controller:", error);
    res.status(500).json({
      message: "Failed to fetch subject wise attendance",
      error: error.message,
    });
  }
};

export const getAttendanceByDate = async (req, res) => {
  try {
    const studentId = req.user.id;
    const dateStr = req.query.date;
    if (!dateStr) {
      return res
        .status(400)
        .json({ message: "Date query parameter is required" });
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const attendanceRecord = await AttendanceSchema.findOne({
      studentId: studentId,
    }).lean();
    if (!attendanceRecord || !Array.isArray(attendanceRecord.attendance)) {
      return res
        .status(201)
        .json({ message: "No attendance record found", subjects: [] });
    }

    const foundSlots = [];

    for (const daily of attendanceRecord.attendance) {
      const dailyDate = new Date(daily.date);
      if (
        dailyDate.getFullYear() === date.getFullYear() &&
        dailyDate.getMonth() === date.getMonth() &&
        dailyDate.getDate() === date.getDate()
      ) {
        if (Array.isArray(daily.slots)) {
          foundSlots.push(...daily.slots);
        }
      }
    }
    if (foundSlots.length === 0) {
      return res.status(200).json({
        date: dateStr,
        subjects: {},
      });
    }
    const subjectIds = [
      ...new Set(foundSlots.map((slot) => slot.subject.toString())),
    ];

    const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean();

    const subjectMap = {};
    subjects.forEach((subj) => {
      subjectMap[subj._id.toString()] = subj.name;
    });

    const subjectStatus = {};
    for (const slot of foundSlots) {
      const subjName = subjectMap[slot.subject.toString()] || "Unknown";
      subjectStatus[subjName] = slot.status;
    }

    res.status(200).json({
      date: dateStr,
      subjects: subjectStatus,
    });
  } catch (error) {
    console.error("Error in getAttendanceByDate controller:", error);
    res.status(500).json({
      message: "Failed to fetch attendance by date",
      error: error.message,
    });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (!student.semester) {
      return res.status(400).json({
        message: "Student has no assigned semester",
        studentInfo: {
          id: student._id,
          name: student.name,
          register: student.register,
        },
      });
    }

    const messages = await Messages.find({
      semesterId: student.semester,
      courseId: student.course,
    }).populate("sender");

    if (!messages) {
      return res
        .status(201)
        .json({ message: "No notifications found", msg: [] });
    }

    if (messages.length === 0)
      return res
        .status(201)
        .json({ message: "No notifications found", msg: [] });

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

export const getProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findById(studentId).populate(
      "semester course"
    );
    if (!student) return res.status(404).json({ message: "Student not found" });

    const baseUrl = "http://miserably-arriving-adder.ngrok-free.app";

    res.status(200).json({
      name: student.name,
      class: student.course?.name,
      semester: student.semester?.name,
      admission: student.admission,
      phone: student.phone,
      DOB: student.dob,
      image: student.image
        ? `${baseUrl}/uploads/students/${student.image}`
        : null,
    });
  } catch (error) {
    console.error("Error in getProfile controller:", error);
    res.status(500).json({
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

export const getMarks = async (req, res) => {
  try {
    const studentId = req.user.id;
    // Define the base URL to construct the full image path
    const baseUrl = "http://miserably-arriving-adder.ngrok-free.app";

    // Fetch student (if you still need to populate other info)
    const student = await Student.findById(studentId).populate("course");
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Find marks document
    const marksData = await Marks.findOne({ studentId: student._id })
      .populate("course")
      .populate("slortes.semester")
      .populate("slortes.marks.subject");

    if (!marksData)
      return res
        .status(201)
        .json({ message: "Marks not found", semesters: [] });

    const semestersResult = [];

    for (const slot of marksData.slortes) {
      const semester = slot.semester;
      const grouped = {};

      for (const mark of slot.marks) {
        const subject = mark.subject;
        const subjId = subject._id.toString();

        const obtained = mark.marks || 0;
        const total = mark.total || 0;
        const percentage = total ? Math.floor((obtained / total) * 100) : 0;

        let performance = "";
        if (percentage < 40) performance = "Bad";
        else if (percentage < 60) performance = "Average";
        else if (percentage < 80) performance = "Good";
        else performance = "Excellent";

        const examInfo = {
          id: mark._id,
          examName: mark.examName,
          date: mark.date,
          marks: obtained,
          total: total,
          percentage,
          performance,
        };

        if (!grouped[subjId]) {
          grouped[subjId] = {
            subject: {
              _id: subject._id,
              name: subject.name,
              // MODIFIED: Construct the full image URL
              image: subject.image
                ? `${baseUrl}/uploads/icons/${subject.image}`
                : null,
            },
            exams: [examInfo],
            totalObtained: obtained,
            totalPossible: total,
          };
        } else {
          grouped[subjId].exams.push(examInfo);
          grouped[subjId].totalObtained += obtained;
          grouped[subjId].totalPossible += total;
        }
      }

      const semesterSubjects = Object.values(grouped).map((entry) => {
        const { totalObtained, totalPossible } = entry;
        const overallPercentage = totalPossible
          ? Math.floor((totalObtained / totalPossible) * 100)
          : 0;

        let overallPerformance = "";
        if (overallPercentage < 40) overallPerformance = "Bad";
        else if (overallPercentage < 60) overallPerformance = "Average";
        else if (overallPercentage < 80) overallPerformance = "Good";
        else overallPerformance = "Excellent";

        return {
          subject: entry.subject,
          percentage: overallPercentage,
          performance: overallPerformance,
          exams: entry.exams,
        };
      });

      semestersResult.push({
        semester: {
          _id: semester._id,
          name: semester.name,
        },
        subjects: semesterSubjects,
      });
    }

    res
      .status(200)
      .json({ course: marksData.course, semesters: semestersResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStudentOtp = async (req, res) => {
  try {
    const studentId = req.user.id;

    const otpDoc = await StudentOtp.findOne({ studentId });
    if (!otpDoc) {
      return res
        .status(201)
        .json({ success: false, message: "OTP not found or expired" });
    }

    return res.status(200).json({
      success: true,
      otp: otpDoc.otp,
      expires: otpDoc.otpExpires,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getStudentCheckout = async (req, res) => {
  try {
    const studentId = req.user.id;

    //  Verify student
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    //  Get all checkouts for this student
    const checkouts = await Checkout.find({ studentId }).populate(
      "Books.bookId"
    );
    if (!checkouts || checkouts.length === 0) {
      return res.status(404).json({ message: "Checkout not found" });
    }

    //  Collect only pending books
    const pendingBooks = [];
    for (const checkout of checkouts) {
      const books = await Promise.all(
        checkout.Books.map(async (b) => {
          if (b.status !== "pending") return null; // skip non-pending

          const libBook = b.bookId;
          if (!libBook || !libBook.ISBN) return null;

          try {
            const response = await axios.get(
              `https://openlibrary.org/api/books?bibkeys=ISBN:${libBook.ISBN}&format=json&jscmd=data`
            );

            const bookInfo = response.data[`ISBN:${libBook.ISBN}`];
            return {
              _id: libBook._id,
              ISBN: libBook.ISBN,
              title: bookInfo?.title || "Unknown Title",
              cover: bookInfo?.cover?.medium || null,
              status: b.status,
              checkoutDate: checkout.checkoutDate,
              dueDate: checkout.duedate,
            };
          } catch (err) {
            console.error("Error fetching book info:", err.message);
            return {
              _id: libBook._id,
              ISBN: libBook.ISBN,
              title: "Unknown Title",
              cover: null,
              status: b.status,
              checkoutDate: checkout.checkoutDate,
              dueDate: checkout.duedate,
            };
          }
        })
      );

      pendingBooks.push(...books.filter(Boolean));
    }

    // ✅ Send response
    return res.status(200).json({
      totalPending: pendingBooks.length,
      books: pendingBooks,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
