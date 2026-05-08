// timetableApi.ts
import api from "@/lib/api"; // already configured with baseURL

// ⏰ Add / Update timetable
export const addOrUpdateTimeTable = async (data: any) => {
  const res = await api.post("/timetables", data);
  return res.data;
};

// 📋 Get all timetables
export const getAllTimeTables = async () => {
  const res = await api.get("/timetables");
  return res.data;
};

// ❌ Delete timetable
export const deleteTimeTable = async (id: string) => {
  const res = await api.delete(`/timetables/${id}`);
  return res.data;
};

// 👨‍🏫 Get teachers by course & semester
export const getTeachersByCourseAndSemester = async (
  courseId: string,
  semesterId: string
) => {
  const res = await api.get(`/timetables/teacher/${courseId}/${semesterId}`);
  return res.data;
};

// 📚 Get subjects by course & semester
export const getSubjectsByCourseAndSemester = async (
  courseId: string,
  semesterId: string
) => {
  const res = await api.get(`/timetables/subject/${courseId}/${semesterId}`);
  return res.data;
};
