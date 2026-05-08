import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/login";
import Enrollment from "./pages/enrollment";
import Courses from "./pages/courses";
import Profile from "./pages/profile";
import Unauthorized from "./pages/Unauthorized";
import { AppSidebar } from "./components/app-sidebar";
import { SidebarTrigger, SidebarProvider } from "./components/ui/sidebar";
import { RoleRoute } from "./lib/RoleRoute";
import Subject from "./pages/subject";
import TeacherAssign from "./pages/teacherAssign";
import Timetable from "./pages/timetable";
import Department from "./pages/department";

const App = () => {
  const location = useLocation();
  const hideSidebar = location.pathname === "/login";

  if (hideSidebar) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <Routes>
        {/* Principal -> all routes */}
        <Route
          path="/courses"
          element={
            <RoleRoute allowedRoles={["Principal", "Teacher"]}>
              <Courses />
            </RoleRoute>
          }
        />
        <Route
          path="/subject"
          element={
            <RoleRoute allowedRoles={["Principal", "HOD"]}>
              <Subject />
            </RoleRoute>
          }
        />
        <Route
          path="/department"
          element={
            <RoleRoute allowedRoles={["Principal"]}>
              <Department />
            </RoleRoute>
          }
        />
        <Route
          path="/enrollment"
          element={
            <RoleRoute allowedRoles={["Principal", "HOD", "Teacher"]}>
              <Enrollment />
            </RoleRoute>
          }
        />
        <Route
          path="/teacher-assign"
          element={
            <RoleRoute allowedRoles={["Principal"]}>
              <TeacherAssign />
            </RoleRoute>
          }
        />
        <Route
          path="/timetable"
          element={
            <RoleRoute allowedRoles={["Principal", "HOD", "Teacher"]}>
              <Timetable />
            </RoleRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <RoleRoute allowedRoles={["Teacher", "Principal", "HOD"]}>
              <Profile />
            </RoleRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </SidebarProvider>
  );
};

export default App;
