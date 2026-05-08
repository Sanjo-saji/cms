// src/types/schedule.ts

export interface ScheduleClass {
  _id?: string;
  course: {
    _id: string;
    name: string;
  };
  semester: {
    _id: string;
    name: string;
  };
  subject: {
    _id: string;
    name: string;
  };
  time: string; // Backend uses single time field, e.g., "09:00"
  conflictType?: 'teacher' | 'none';
}

export interface ScheduleDay {
  day: string; // Monday, Tuesday, Wednesday, Thursday, Friday
  contents: ScheduleClass[]; // Backend uses 'contents' instead of 'classes'
}

export interface TeacherSchedule {
  _id?: string;
  teacher: {
    _id: string;
    name: string;
    employee_id?: string;
  };
  schedule: ScheduleDay[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ScheduleFormData {
  teacherId: string;
  day: string;
  courseId: string;
  semesterId: string;
  subjectId: string;
  startTime: string;
  endTime: string;
}

export interface UpdateScheduleData {
  day: string;
  oldCourse: string;
  oldSemester: string;
  oldSubject: string;
  newCourse: string;
  newSemester: string;
  newSubject: string;
  newTime: string;
}

export interface ScheduleStats {
  totalSchedules: number;
  activeTeachers: number;
  weeklyClasses: number;
  timeSlots: number;
}

// Days of the week
export const WEEK_DAYS = [
  "Monday",
  "Tuesday", 
  "Wednesday",
  "Thursday",
  "Friday"
] as const;

// Time slots for scheduling
export const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"
] as const;


// Conflict detection interface
export interface ScheduleConflict {
  type: 'teacher';
  message: string;
  conflictingSchedule: {
    teacher?: string;
    subject: string;
    day: string;
    startTime: string;
    endTime: string;
  };
}

// Teacher assignment interface for scheduling
export interface TeacherAssignment {
  _id: string;
  course: {
    _id: string;
    name: string;
  };
  semester: {
    _id: string;
    name: string;
  };
  subject: {
    _id: string;
    name: string;
  };
}
