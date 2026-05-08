import api from "@/lib/api";

export interface Student {
  _id: string;
  register: string;
  name: string;
  admission: string;
  phone: string;
  dob?: string;
  course?: string | { _id: string; name: string };
  semester?: string | { _id: string; name: string };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  image?: string;
}

export const getStudents = async (): Promise<Student[]> => {
  try {
    const res = await api.get("/get-students");
    return res.data.students || [];
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return [];
  }
};
