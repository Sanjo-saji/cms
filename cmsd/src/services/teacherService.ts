// services/teacherService.ts
import api from "@/lib/api";

export interface Teacher {
  _id: string;
  name: string;
  employee_id: string;
  role: string;
  department?: string;
  classInCharge?: { course: string; semester: string } | null;
  phone?: string;
  dob?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  image?: string;
  departmentHead: boolean;
}

export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    const res = await api.get("/get-teachers");
    const data = res.data;
    return data?.teachers || [];
  } catch (err) {
    console.error("Failed to fetch teachers:", err);
    return [];
  }
};
