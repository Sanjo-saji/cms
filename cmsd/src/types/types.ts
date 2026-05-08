export interface Course {
  _id: string;
  name: string;
  courseName: string;
  durationYears?: number;
  createdAt?: string;
}

export interface Semester {
  _id: string;
  name: string;
  course: string;
}

export interface Subject {
  _id: string;
  name: string;
  course: string | { _id: string; name: string };
  semester: string | { _id: string; name: string };
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

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
