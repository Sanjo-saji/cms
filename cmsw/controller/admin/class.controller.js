import Class from "../../model/class/class.model.js";
import Course from "../../model/course/course.model.js";
import Semester from "../../model/semester/semesters.model.js";

// Create a new class
export const createClass = async (req, res) => {
  const { name, course, semester } = req.body;

  // Validate required fields
  if (!name || !course || !semester) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields: name, course, and semester are required" 
    });
  }

  try {
    // Validate that course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ 
        success: false, 
        message: "Course not found" 
      });
    }

    // Validate that semester exists
    const semesterExists = await Semester.findById(semester);
    if (!semesterExists) {
      return res.status(404).json({ 
        success: false, 
        message: "Semester not found" 
      });
    }

    // Check if class already exists with same name, course, and semester
    const existingClass = await Class.findOne({ name, course, semester });
    if (existingClass) {
      return res.status(409).json({ 
        success: false, 
        message: "Class with this name already exists for the given course and semester" 
      });
    }

    // Create new class
    const newClass = await Class.create({
      name,
      course,
      semester
    });

    // Populate the course and semester details in response
    const populatedClass = await Class.findById(newClass._id)
      .populate('course', 'name courseName durationYears')
      .populate('semester', 'name');

    return res.status(201).json({ 
      success: true, 
      message: "Class created successfully", 
      class: populatedClass
    });
  } catch (error) {
    console.error("Error creating class:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get all classes
export const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('course', 'name courseName durationYears')
      .populate('semester', 'name')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({ 
      success: true, 
      classes,
      count: classes.length 
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get class by ID
export const getClassById = async (req, res) => {
  const { id } = req.params;

  try {
    const classData = await Class.findById(id)
      .populate('course', 'name courseName durationYears')
      .populate('semester', 'name');
    
    if (!classData) {
      return res.status(404).json({ 
        success: false, 
        message: "Class not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      class: classData 
    });
  } catch (error) {
    console.error("Error fetching class:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get classes by course
export const getClassesByCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    // Validate that course exists
    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(404).json({ 
        success: false, 
        message: "Course not found" 
      });
    }

    const classes = await Class.find({ course: courseId })
      .populate('course', 'name courseName durationYears')
      .populate('semester', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ 
      success: true, 
      classes,
      count: classes.length,
      course: courseExists
    });
  } catch (error) {
    console.error("Error fetching classes by course:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get classes by semester
export const getClassesBySemester = async (req, res) => {
  const { semesterId } = req.params;

  try {
    // Validate that semester exists
    const semesterExists = await Semester.findById(semesterId);
    if (!semesterExists) {
      return res.status(404).json({ 
        success: false, 
        message: "Semester not found" 
      });
    }

    const classes = await Class.find({ semester: semesterId })
      .populate('course', 'name courseName durationYears')
      .populate('semester', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ 
      success: true, 
      classes,
      count: classes.length,
      semester: semesterExists
    });
  } catch (error) {
    console.error("Error fetching classes by semester:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update class
export const updateClass = async (req, res) => {
  const { id } = req.params;
  const { name, course, semester } = req.body;

  try {
    const classData = await Class.findById(id);
    if (!classData) {
      return res.status(404).json({ 
        success: false, 
        message: "Class not found" 
      });
    }

    // Validate course if provided
    if (course) {
      const courseExists = await Course.findById(course);
      if (!courseExists) {
        return res.status(404).json({ 
          success: false, 
          message: "Course not found" 
        });
      }
    }

    // Validate semester if provided
    if (semester) {
      const semesterExists = await Semester.findById(semester);
      if (!semesterExists) {
        return res.status(404).json({ 
          success: false, 
          message: "Semester not found" 
        });
      }
    }

    // Check for duplicate if name, course, or semester is being changed
    if (name || course || semester) {
      const checkName = name || classData.name;
      const checkCourse = course || classData.course;
      const checkSemester = semester || classData.semester;

      const existingClass = await Class.findOne({ 
        name: checkName, 
        course: checkCourse, 
        semester: checkSemester,
        _id: { $ne: id } // Exclude current class from check
      });

      if (existingClass) {
        return res.status(409).json({ 
          success: false, 
          message: "Class with this name already exists for the given course and semester" 
        });
      }
    }

    // Update fields
    if (name) classData.name = name;
    if (course) classData.course = course;
    if (semester) classData.semester = semester;

    await classData.save();

    // Populate the updated class
    const updatedClass = await Class.findById(classData._id)
      .populate('course', 'name courseName durationYears')
      .populate('semester', 'name');

    return res.status(200).json({ 
      success: true, 
      message: "Class updated successfully", 
      class: updatedClass 
    });
  } catch (error) {
    console.error("Error updating class:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Delete class
export const deleteClass = async (req, res) => {
  const { id } = req.params;

  try {
    const classData = await Class.findById(id);
    if (!classData) {
      return res.status(404).json({ 
        success: false, 
        message: "Class not found" 
      });
    }

    await Class.findByIdAndDelete(id);

    return res.status(200).json({ 
      success: true, 
      message: `Class "${classData.name}" deleted successfully` 
    });
  } catch (error) {
    console.error("Error deleting class:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};
