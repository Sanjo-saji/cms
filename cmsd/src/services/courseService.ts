import api from "@/lib/api";

// Get all courses
export const fetchCourses = async () => {
  const res = await api.get("/class/courses");

  if (Array.isArray(res.data.courses)) {
    return res.data.courses;
  } else {
    console.warn("Unexpected courses response:", res.data);
    return [];
  }
};

// Get course by ID
export const fetchCourseById = async (id: string) => {
  const res = await api.get(`/class/course/${id}`);
  return res.data.course;
};

// Create course (Principal only)
export const createCourse = async (courseData: {
  name: string;
  courseName: string;
  durationYears: number;
}) => {
  const res = await api.post("/class/create-course", courseData);
  return res.data;
};

// Update course
export const updateCourse = async (id: string, courseData: {
  name: string;
  courseName: string;
  durationYears: number;
}) => {
  const res = await api.put(`/class/update-course/${id}`, courseData);
  return res.data;
};

// Delete course
export const deleteCourse = async (id: string) => {
  const res = await api.delete(`/class/delete-course/${id}`);
  return res.data;
};

// Delete course and all references (Principal only)
export const deleteCourseAndReferences = async (id: string) => {
  const res = await api.delete(`/class/delete-course-and-references/${id}`);
  return res.data;
};
