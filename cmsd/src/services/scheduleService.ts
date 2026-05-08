// src/services/scheduleService.ts
import API from "@/lib/api";
import type {
  TeacherSchedule,
  ScheduleFormData,
  UpdateScheduleData,
  ScheduleStats,
  ScheduleConflict,
  TeacherAssignment
} from "@/types/schedule";

// Get all teacher schedules
export const getAllSchedules = async (): Promise<TeacherSchedule[]> => {
  try {
    const response = await API.get("/schedule");
    return response.data || [];
  } catch (error: any) {
    console.error("Failed to fetch schedules:", error);
    return [];
  }
};

// Add a new schedule entry
export const addSchedule = async (data: ScheduleFormData): Promise<TeacherSchedule> => {
  try {
    const requestData = {
      teacherId: data.teacherId,
      day: data.day,
      course: data.courseId,
      semester: data.semesterId,
      subject: data.subjectId,
      time: data.startTime // Backend expects single time field, not startTime/endTime
    };
    console.log("Creating schedule with data:", requestData);
    const response = await API.post("/schedule", requestData);
    return response.data.schedule;
  } catch (error) {
    console.error("Failed to create schedule:", error);
    throw error;
  }
};

// Update an existing schedule entry
export const updateSchedule = async (
  teacherId: string, 
  data: UpdateScheduleData
): Promise<{ message: string; schedule: TeacherSchedule }> => {
  try {
    const requestData = {
      day: data.day,
      oldCourse: data.oldCourse,
      oldSemester: data.oldSemester,
      oldSubject: data.oldSubject,
      newCourse: data.newCourse,
      newSemester: data.newSemester,
      newSubject: data.newSubject,
      newTime: data.newTime
    };
    console.log("Updating schedule with data:", requestData);
    const response = await API.put(`/schedule/${teacherId}`, requestData);
    return response.data;
  } catch (error) {
    console.error("Failed to update schedule:", error);
    throw error;
  }
};

// Delete a schedule entry
export const deleteSchedule = async (
  teacherId: string, 
  data: { day: string; course: string; semester: string; subject: string }
): Promise<void> => {
  try {
    console.log("Deleting schedule with data:", { teacherId, ...data });
    await API.delete(`/schedule/${teacherId}`, { data });
  } catch (error) {
    console.error("Failed to delete schedule:", error);
    throw error;
  }
};


// Get teacher assignments for scheduling
export const getTeacherAssignments = async (teacherId: string): Promise<TeacherAssignment[]> => {
  try {
    const { getExistingAssignments } = await import("./assignmentService");
    const allAssignments = await getExistingAssignments();
    
    const teacherAssignment = allAssignments.find(assignment => 
      assignment.teacher?._id === teacherId
    );
    
    if (!teacherAssignment || !teacherAssignment.assignments || !Array.isArray(teacherAssignment.assignments)) {
      return [];
    }
    
    // Convert assignment items to teacher assignments format
    const teacherAssignments: TeacherAssignment[] = await Promise.all(
      teacherAssignment.assignments.map(async (item) => {
        // Check if subject field exists
        if (!item.subject) {
          try {
            const { getSubjectsByCourseAndSemester } = await import("./assignmentService");
            const subjects = await getSubjectsByCourseAndSemester(item.course._id, item.semester._id);
            
            if (subjects && subjects.length > 0) {
              const assignedSubject = subjects[0];
              return {
                _id: `${teacherId}-${item.course._id}-${item.semester._id}-${assignedSubject._id}`,
                course: item.course,
                semester: item.semester,
                subject: assignedSubject
              };
            } else {
              const placeholderSubject = {
                _id: `${item.course._id}-${item.semester._id}-placeholder`,
                name: "Subject Not Found"
              };
              return {
                _id: `${teacherId}-${item.course._id}-${item.semester._id}-placeholder`,
                course: item.course,
                semester: item.semester,
                subject: placeholderSubject
              };
            }
          } catch (error) {
            console.error("Failed to fetch subjects for assignment:", error);
            const placeholderSubject = {
              _id: `${item.course._id}-${item.semester._id}-error`,
              name: "Error Loading Subject"
            };
            return {
              _id: `${teacherId}-${item.course._id}-${item.semester._id}-error`,
              course: item.course,
              semester: item.semester,
              subject: placeholderSubject
            };
          }
        }
        
        return {
          _id: `${teacherId}-${item.course._id}-${item.semester._id}-${item.subject._id}`,
          course: item.course,
          semester: item.semester,
          subject: item.subject
        };
      })
    );
    
    return teacherAssignments;
  } catch (error) {
    console.error("Failed to fetch teacher assignments:", error);
    return [];
  }
};

// Check for schedule conflicts
export const checkScheduleConflicts = async (
  teacherId: string,
  day: string,
  startTime: string,
  endTime: string
): Promise<ScheduleConflict[]> => {
  try {
    const response = await API.post("/schedule/check-conflicts", {
      teacherId,
      day,
      startTime,
      endTime
    });
    return response.data.conflicts || [];
  } catch (error) {
    console.error("Failed to check conflicts:", error);
    return [];
  }
};

// Get schedule statistics
export const getScheduleStats = async (): Promise<ScheduleStats> => {
  try {
    const schedules = await getAllSchedules();
    console.log("📊 Calculating stats for schedules:", schedules);
    
    const totalSchedules = schedules.length;
    const activeTeachers = new Set(schedules.map(s => s.teacher?._id).filter(Boolean)).size;
    
    const weeklyClasses = schedules.reduce((total, schedule) => {
      if (!schedule.schedule || !Array.isArray(schedule.schedule)) {
        console.log("⚠️ Schedule has no schedule array:", schedule);
        return total;
      }
      
      return total + schedule.schedule.reduce((dayTotal, day) => {
        if (!day || !day.contents || !Array.isArray(day.contents)) {
          console.log("⚠️ Day has no contents array:", day);
          return dayTotal;
        }
        return dayTotal + day.contents.length;
      }, 0);
    }, 0);
    
    const timeSlots = new Set(
      schedules.flatMap(schedule => {
        if (!schedule.schedule || !Array.isArray(schedule.schedule)) {
          return [];
        }
        return schedule.schedule.flatMap(day => {
          if (!day || !day.contents || !Array.isArray(day.contents)) {
            return [];
          }
          return day.contents.map(cls => cls.time).filter(Boolean);
        });
      })
    ).size;

    console.log("📊 Calculated stats:", { totalSchedules, activeTeachers, weeklyClasses, timeSlots });

    return {
      totalSchedules,
      activeTeachers,
      weeklyClasses,
      timeSlots
    };
  } catch (error) {
    console.error("Failed to calculate schedule stats:", error);
    return {
      totalSchedules: 0,
      activeTeachers: 0,
      weeklyClasses: 0,
      timeSlots: 0
    };
  }
};
