import api from "@/lib/api";

// Get all subjects
export const fetchSubjects = async () => {
  try {
    console.log("Fetching subjects from /subjects endpoint...");
    const res = await api.get("/subjects");
    console.log("Subjects response:", res.data);
    
    if (Array.isArray(res.data.subjects)) {
      console.log("Found subjects:", res.data.subjects.length);
      console.log("Sample subject structure:", res.data.subjects[0]);
      return res.data.subjects;
    } else {
      console.warn("Unexpected subjects response:", res.data);
      return [];
    }
  } catch (error: any) {
    console.error("Error fetching subjects:", error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch subjects";
    console.error("Error details:", errorMessage);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.error("Authentication required. Please login first.");
    }
    
    return [];
  }
};

// Create a new subject
export const createSubject = async (payload: { 
  name: string; 
  course: string; 
  semester: string; 
  image?: File 
}) => {
  try {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('course', payload.course);
    formData.append('semester', payload.semester);
    
    if (payload.image) {
      formData.append('image', payload.image);
    }

    const res = await api.post("/create-subject", formData);
    
    // Transform the response to match expected format
    return {
      success: true,
      subject: res.data.subject,
      message: res.data.message
    };
  } catch (error: any) {
    console.error("Error creating subject:", error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to create subject";
    return { success: false, message: errorMessage };
  }
};

// Update an existing subject
export const updateSubject = async (id: string, payload: { 
  name?: string; 
  course?: string; 
  semester?: string; 
  image?: File 
}) => {
  try {
    const formData = new FormData();
    
    if (payload.name) formData.append('name', payload.name);
    if (payload.course) formData.append('course', payload.course);
    if (payload.semester) formData.append('semester', payload.semester);
    if (payload.image) formData.append('image', payload.image);

    const res = await api.put(`/update-subject/${id}`, formData);
    
    // Transform the response to match expected format
    return {
      success: true,
      subject: res.data.subject,
      message: res.data.message
    };
  } catch (error: any) {
    console.error("Error updating subject:", error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to update subject";
    return { success: false, message: errorMessage };
  }
};

// Delete a subject
export const deleteSubject = async (id: string) => {
  try {
    const res = await api.delete(`/delete-subject/${id}`);
    
    // Transform the response to match expected format
    return {
      success: true,
      message: res.data.message
    };
  } catch (error: any) {
    console.error("Error deleting subject:", error);
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete subject";
    return { success: false, message: errorMessage };
  }
};
