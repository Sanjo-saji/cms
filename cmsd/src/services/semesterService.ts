import api from "@/lib/api";

// Get semesters by course id
export const fetchSemestersByCourse = async (courseId: string) => {
  // We keep this log to know which request we're looking at
  console.log("Fetching semesters for Course ID:", courseId);

  try {
    // Try multiple possible endpoints since the exact route might be different
    let res;
    let endpointUsed = "";
    
    const possibleEndpoints = [
      `/courses-by-semester/${courseId}`,
      `/class/courses-by-semester/${courseId}`,
      `/admin/courses-by-semester/${courseId}`,
      `/semesters/course/${courseId}`,
      `/class/semesters/${courseId}`
    ];

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        res = await api.get(endpoint);
        endpointUsed = endpoint;
        console.log(`✅ Success with endpoint: ${endpoint}`);
        break;
      } catch (endpointError: any) {
        console.log(`❌ Failed with endpoint: ${endpoint}`, endpointError?.response?.status);
        continue;
      }
    }

    if (!res) {
      throw new Error("All endpoints failed");
    }

    // --- DEBUGGING THE RESPONSE ---
    console.log("Full API Response object:", res);
    console.log("Data received from API:", res.data);
    console.log("Endpoint that worked:", endpointUsed);
    // -----------------------------

    if (Array.isArray(res.data)) {
      return res.data;
    } else if (res.data && Array.isArray(res.data.semesters)) {
      return res.data.semesters;
    } else {
      console.warn(
        "Unexpected response format. Expected an array but got:",
        res.data
      );
      return []; // Return an empty array if the format is wrong
    }
  } catch (error) {
    // This will catch network errors or 4xx/5xx status codes
    console.error("API call failed for fetchSemestersByCourse:", error);
    return []; // Return an empty array on error so the app doesn't crash
  }
};
