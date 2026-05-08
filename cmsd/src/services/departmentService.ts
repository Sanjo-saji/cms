import API from "@/lib/api";

// Get departments (id + name only)
export const fetchDepartments = async () => {
  try {
    const res = await API.get("/get-departments");
    // API returns: { success: true, departments: [{ _id, name }] }
    if (res.data.success && Array.isArray(res.data.departments)) {
      return res.data.departments;
    }
    return [];
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
};
