// src/services/assignmentService.ts
import API from "@/lib/api";
import type {
  Department,
  Course,
  Semester,
  Subject,
  Teacher,
  Assignment,
  AssignmentFormData,
  AssignmentItem,
  UpdateAssignmentData
} from "@/types/assignment";

export const getDepartmentsForAssignment = async (): Promise<Department[]> => {
  try {
    const response = await API.get("/get-departments");
    return response.data.departments || [];
  } catch (error) {
    console.error("Failed to fetch departments:", error);
    // Return empty array instead of throwing to prevent page crash
    return [];
  }
};

export const getCoursesByDepartment = async (departmentId: string): Promise<Course[]> => {
  try {
    const response = await API.get(`/get-departments`);
    const departments = response.data.departments || [];
    const department = departments.find((dept: any) => dept._id === departmentId);
    return department?.courses || [];
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    // Return empty array instead of throwing to prevent page crash
    return [];
  }
};

export const getSemestersByCourse = async (courseId: string): Promise<Semester[]> => {
  try {
    // Use the working semester service
    const { fetchSemestersByCourse } = await import("./semesterService");
    const semesters = await fetchSemestersByCourse(courseId);
    return semesters.map((semester: any) => ({
      _id: semester._id,
      name: semester.name
    }));
  } catch (error) {
    console.error("Failed to fetch semesters:", error);
    // Return empty array instead of throwing to prevent page crash
    return [];
  }
};

export const getSubjectsByCourseAndSemester = async (
  courseId: string,
  semesterId: string
): Promise<Subject[]> => {
  try {
    console.log(`Fetching subjects for course: ${courseId}, semester: ${semesterId}`);
    const response = await API.get(`/assignment/subjects/${courseId}/${semesterId}`);
    console.log("Subjects response:", response.data);
    return response.data.subjects || [];
  } catch (error) {
    console.error(`Failed to fetch subjects for course ${courseId}, semester ${semesterId}:`, error);
    // Return empty array instead of throwing to prevent page crash
    return [];
  }
};

export const getTeachersForAssignment = async (): Promise<Teacher[]> => {
  try {
    const response = await API.get("/get-teachers");
    return response.data.teachers || [];
  } catch (error) {
    console.error("Failed to fetch teachers:", error);
    // Return empty array instead of throwing to prevent page crash
    return [];
  }
};

export const createAssignment = async (data: AssignmentFormData): Promise<Assignment> => {
  try {
    // Include subject field for specific subject assignments
    const requestData = {
      teacherId: data.teacherId,
      course: data.courseId,
      semester: data.semesterId,
      subject: data.subjectId, // Now including subject for specific assignments
      department: data.department // Include department for better tracking
    };
    console.log("🎯 Creating assignment with data:", requestData);
    console.log("🎯 Assignment details:", {
      teacherId: data.teacherId,
      courseId: data.courseId,
      semesterId: data.semesterId,
      subjectId: data.subjectId,
      department: data.department
    });
    console.log("✅ Creating specific subject assignment");
    
    const response = await API.post("/assignment", requestData);
    console.log("🎯 Assignment creation response:", response.data);
    
    return response.data.assignment;
  } catch (error: any) {
    console.error("❌ Failed to create assignment:", error);
    if (error.response?.data) {
      console.error("❌ Error response data:", error.response.data);
    }
    throw error;
  }
};

export const getExistingAssignments = async (): Promise<Assignment[]> => {
  try {
    const response = await API.get("/assignment?populate=subject");
    const assignments = response.data || [];
    
    return assignments;
  } catch (error) {
    console.error("Failed to fetch assignments:", error);
    // Return empty array instead of throwing to prevent page crash
    return [];
  }
};

export const updateAssignment = async (teacherId: string, data: UpdateAssignmentData): Promise<{ message: string; assignments: AssignmentItem[] }> => {
  try {
    const response = await API.put(`/assignment/${teacherId}`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to update assignment:", error);
    throw error;
  }
};

export const deleteAssignment = async (teacherId: string, data: { course: string, semester: string, subject?: string }): Promise<void> => {
  try {
    console.log("🗑️ Deleting assignment with data:", { teacherId, ...data });
    await API.delete(`/assignment/${teacherId}`, { data });
  } catch (error) {
    console.error("Failed to delete assignment:", error);
    throw error;
  }
};

export const getAssignedTeachersByCourse = async (courseId: string, semesterId: string): Promise<Teacher[]> => {
  try {
    const response = await API.get(`/assignment/assigned-teacher?course=${courseId}&semester=${semesterId}`);
    return response.data.teachers || [];
  } catch (error) {
    console.error("Failed to fetch assigned teachers:", error);
    throw error;
  }
};

// Check if a teacher is already assigned to a course-semester combination
export const checkExistingAssignment = async (teacherId: string, courseId: string, semesterId: string): Promise<boolean> => {
  try {
    const assignments = await getExistingAssignments();
    const teacherAssignment = assignments.find(assignment => assignment.teacher._id === teacherId);
    
    if (!teacherAssignment) return false;
    
    const existingAssignment = teacherAssignment.assignments.find(assignment => 
      assignment.course._id === courseId && assignment.semester._id === semesterId
    );
    
    return !!existingAssignment;
  } catch (error) {
    console.error("Failed to check existing assignment:", error);
    return false;
  }
};

// Check if a subject is already assigned to another teacher
export const checkSubjectAssignment = async (subjectId: string, courseId: string, semesterId: string): Promise<{isAssigned: boolean, assignedTeacher?: string}> => {
  try {
    const assignments = await getExistingAssignments();
    
    for (const assignment of assignments) {
      for (const assignmentItem of assignment.assignments || []) {
        // Check if this exact subject is already assigned to another teacher
        if (assignmentItem.course._id === courseId && 
            assignmentItem.semester._id === semesterId &&
            assignmentItem.subject?._id === subjectId) {
          return {
            isAssigned: true,
            assignedTeacher: assignment.teacher.name
          };
        }
      }
    }
    
    return { isAssigned: false };
  } catch (error) {
    console.error("Failed to check subject assignment:", error);
    return { isAssigned: false };
  }
};

// Check if a teacher is already assigned to the same course-semester combination
export const checkTeacherCourseSemesterAssignment = async (teacherId: string, courseId: string, semesterId: string): Promise<boolean> => {
  try {
    const assignments = await getExistingAssignments();
    const teacherAssignment = assignments.find(assignment => assignment.teacher._id === teacherId);
    
    if (!teacherAssignment) return false;
    
    const existingAssignment = teacherAssignment.assignments.find(assignment => 
      assignment.course._id === courseId && assignment.semester._id === semesterId
    );
    
    return !!existingAssignment;
  } catch (error) {
    console.error("Failed to check teacher course-semester assignment:", error);
    return false;
  }
};

// Get all assignments for a specific subject to show conflicts
export const getSubjectAssignments = async (subjectId: string, courseId: string, semesterId: string): Promise<Assignment[]> => {
  try {
    const assignments = await getExistingAssignments();
    
    return assignments.filter(assignment => 
      assignment.assignments?.some(item => 
        item.course._id === courseId && 
        item.semester._id === semesterId &&
        item.subject?._id === subjectId
      )
    );
  } catch (error) {
    console.error("Failed to get subject assignments:", error);
    return [];
  }
};
