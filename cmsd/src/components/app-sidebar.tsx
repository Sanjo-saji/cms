import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Label } from "./ui/label";
import { Users, Book, Calendar, Building2, UserCog } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getUserRole } from "@/lib/auth";
import ProfileSection from "./ProfileSection";
const mainLinks = [
  {
    icon: Book,
    label: "Courses",
    path: "/courses",
    roles: ["Principal", "Teacher"],
  },
  {
    icon: Book,
    label: "Subject",
    path: "/subject",
    roles: ["Principal", "HOD"],
  },
  {
    icon: Building2,
    label: "Department",
    path: "/department",
    roles: ["Principal"],
  },
  {
    icon: Users,
    label: "Enrollment",
    path: "/enrollment",
    roles: ["Principal", "HOD", "Teacher"],
  },
  {
    icon: UserCog,
    label: "Teacher Assign",
    path: "/teacher-assign",
    roles: ["Principal"],
  },
  {
    icon: Calendar,
    label: "Timetable",
    path: "/timetable",
    roles: ["Principal", "HOD", "Teacher"],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const role = getUserRole();

  return (
    <Sidebar
      side="left"
      variant="sidebar"
      collapsible="offcanvas"
      className="w-64"
    >
      <SidebarHeader className="font-bold text-lg px-6 py-4 border-b">
        CMSD
      </SidebarHeader>

      {/* Main Links */}
      <SidebarContent className="mt-4 px-2 flex-1">
        <SidebarGroup>
          <SidebarMenu className="space-y-1">
            {mainLinks
              .filter((item) => role && item.roles.includes(role))
              .map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.path}
                        className={`flex items-center px-4 py-2 rounded-lg text-[17px] transition-colors ${
                          isActive
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        <Label>{item.label}</Label>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Profile Section */}
      <SidebarFooter className="border-t px-2 py-3">
        <ProfileSection />
      </SidebarFooter>
    </Sidebar>
  );
}
