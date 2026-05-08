// src/types/department.ts
export interface Course {
  _id: string;
  name: string;
  courseName: string;
  durationYears: number;
  createdAt?: string;
}

export interface Department {
  _id: string;
  name: string;
  courses: Course[];
}
