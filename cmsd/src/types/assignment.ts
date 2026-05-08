// src/types/assignment.ts
export interface Teacher {
  _id: string;
  name: string;
  employee_id: string;
}

export interface Course {
  _id: string;
  name: string;
  courseName: string;
}

export interface Semester {
  _id: string;
  name: string;
}

export interface Subject {
  _id: string;
  name: string;
}

export interface Department {
  _id: string;
  name: string;
}

export interface AssignmentItem {
  course: Course;
  semester: Semester;
  subject: Subject;
}

export interface Assignment {
  _id: string;
  teacher: Teacher;
  department: string;
  assignments: AssignmentItem[];
}

export interface AssignmentFormData {
  teacherId: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
  department: string;
}

export interface UpdateAssignmentData {
  oldCourse: string;
  oldSemester: string;
  oldSubject?: string;
  newCourse: string;
  newSemester: string;
  newSubject?: string;
}