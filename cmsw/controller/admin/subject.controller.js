import Subject from "../../model/student/subjects.model.js";
import Teacher from "../../model/teachers/teachers.model.js";
import Course from "../../model/course/course.model.js";
import fs from "fs";
import path from "path";

export const createSubject = async (req, res) => {
  try {
    // find logged in teacher
    const teacher = await Teacher.findById(req.user.id);

    if (!teacher) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    // allow only Principal or HOD
    if (teacher.role !== "Principal" && teacher.role !== "HOD") {
      return res.status(403).json({
        message: "Access denied. Only Principal and HOD can create subjects.",
      });
    }

    const { name, course, semester } = req.body || {};
    const image = req.file ? req.file.filename : null;

    const subject = new Subject({
      name,
      course,
      semester,
      image,
    });

    await subject.save();
    res.status(201).json({ message: "Subject created successfully", subject });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id);

    if (!teacher) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    if (teacher.role !== "Principal" && teacher.role !== "HOD") {
      return res.status(403).json({
        message: "Access denied. Only Principal and HOD can update subjects.",
      });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    //  Only store filename, not full path
    if (req.file) updateData.image = req.file.filename;

    const subject = await Subject.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!subject) return res.status(404).json({ message: "Subject not found" });

    res.json({ message: "Subject updated successfully", subject });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id);

    if (!teacher) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    if (teacher.role !== "Principal" && teacher.role !== "HOD") {
      return res.status(403).json({
        message: "Access denied. Only Principal and HOD can delete subjects.",
      });
    }

    const { id } = req.params;
    const subject = await Subject.findByIdAndDelete(id);

    if (!subject) return res.status(404).json({ message: "Subject not found" });

    //  remove file from disk
    if (subject.image) {
      const filePath = path.join("cms-icon", subject.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: "Subject deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user.id).populate(
      "department",
      "name"
    );

    if (!teacher) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    let subjects;

    if (teacher.role === "Principal") {
      //  Principal can see all subjects
      subjects = await Subject.find()
        .populate("course", "name")
        .populate("semester", "name");
    } else if (teacher.role === "HOD") {
      //  HOD can only see subjects belonging to their department’s courses
      const courses = await Course.find({
        department: teacher.department._id,
      }).select("_id");

      subjects = await Subject.find({
        course: { $in: courses.map((c) => c._id) },
      })
        .populate("course", "name")
        .populate("semester", "name");
    } else {
      //  Teacher can only see subjects linked to their classInCharge
      if (!teacher.classInCharge) {
        return res.status(403).json({ message: "No class assigned" });
      }

      const classCourse = await Course.findOne({
        _id: teacher.classInCharge.course,
      });
      subjects = await Subject.find({ course: classCourse._id })
        .populate("course", "name")
        .populate("semester", "name");
    }

    return res.status(200).json({
      message: "Subjects fetched successfully",
      subjects,
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
