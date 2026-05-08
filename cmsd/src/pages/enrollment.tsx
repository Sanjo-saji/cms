"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/entrollemnt/StatCard";
import { StudentTable } from "@/components/entrollemnt/StudentTable";
import { TeacherTable } from "@/components/entrollemnt/TeacherTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, GraduationCap } from "lucide-react";
import { StudentControls } from "@/components/entrollemnt/StudentControls";
import { TeacherControls } from "@/components/entrollemnt/TeacherControls";
import { StudentCreateDrawer } from "@/components/entrollemnt/studentCreateDrawer";
import { TeacherCreateDrawer } from "@/components/entrollemnt/TeacherCreateDrawer";
import { DeleteAlertDialog } from "@/components/entrollemnt/DeleteAlertDialog";
import { getUserRole } from "@/lib/auth";

import {
  type Student as ServiceStudent,
  getStudents,
} from "@/services/studentService";
import {
  getTeachers,
  type Teacher as ServiceTeacher,
} from "@/services/teacherService";
import API from "@/lib/api";

export default function Enrollment() {
  // ------------------ State ------------------
  const [students, setStudents] = useState<ServiceStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<ServiceStudent[]>(
    []
  );
  const [teachers, setTeachers] = useState<ServiceTeacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<ServiceTeacher[]>(
    []
  );

  const [selectedStudent, setSelectedStudent] = useState<ServiceStudent | null>(
    null
  );
  const [selectedTeacher, setSelectedTeacher] = useState<ServiceTeacher | null>(
    null
  );

  const [studentDrawerOpen, setStudentDrawerOpen] = useState(false);
  const [teacherDrawerOpen, setTeacherDrawerOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "Student" | "Teacher";
    id: string | null;
  }>({ type: "Student", id: null });

  const role = getUserRole();

  // ------------------ Fetch Data ------------------
  useEffect(() => {
    const fetchStudentsData = async () => {
      try {
        const data = await getStudents();
        setStudents(data || []);
        setFilteredStudents(data || []);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

    fetchStudentsData();

    if (role === "Principal") {
      const fetchTeachersData = async () => {
        try {
          const data = await getTeachers();
          setTeachers(data);
          setFilteredTeachers(data);
        } catch (err) {
          console.error("Error fetching teachers:", err);
        }
      };
      fetchTeachersData();
    }
  }, [role]);

  // ------------------ Student Handlers ------------------
  const handleStudentSearch = (query: string) => {
    if (!query) return setFilteredStudents(students);
    const lowerQuery = query.toLowerCase();
    setFilteredStudents(
      students.filter((s) => s.name.toLowerCase().includes(lowerQuery))
    );
    console.log(filteredStudents);
  };

  const handleSortStudentName = (order: "asc" | "desc") => {
    const sorted = [...filteredStudents].sort((a, b) =>
      order === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
    setFilteredStudents(sorted);
  };

  const handleSortStudentRegister = (order: "asc" | "desc") => {
    const sorted = [...filteredStudents].sort((a, b) =>
      order === "asc"
        ? a.register.localeCompare(b.register)
        : b.register.localeCompare(a.register)
    );
    setFilteredStudents(sorted);
  };

  // ------------------ Teacher Handlers ------------------
  const handleTeacherSearch = (query: string) => {
    if (!query) return setFilteredTeachers(teachers);
    const lowerQuery = query.toLowerCase();
    setFilteredTeachers(
      teachers.filter((t) => t.name.toLowerCase().includes(lowerQuery))
    );
  };

  const handleSortTeacherName = (order: "asc" | "desc") => {
    const sorted = [...filteredTeachers].sort((a, b) =>
      order === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
    setFilteredTeachers(sorted);
  };

  const handleSortTeacherDepartment = (order: "asc" | "desc") => {
    const sorted = [...filteredTeachers].sort((a, b) => {
      const deptA = a.department || "";
      const deptB = b.department || "";
      return order === "asc"
        ? deptA.localeCompare(deptB)
        : deptB.localeCompare(deptA);
    });
    setFilteredTeachers(sorted);
  };

  const handleFilterTeacherRole = (roleFilter: string) => {
    if (!roleFilter) return setFilteredTeachers(teachers);
    setFilteredTeachers(teachers.filter((t) => t.role === roleFilter));
  };

  // ------------------ Delete ------------------
  const handleDeleteConfirm = async () => {
    try {
      if (deleteTarget.type === "Student" && deleteTarget.id) {
        await API.delete(`/delete-student/${deleteTarget.id}`);
        setStudents((prev) => prev.filter((s) => s._id !== deleteTarget.id));
        setFilteredStudents((prev) =>
          prev.filter((s) => s._id !== deleteTarget.id)
        );
      } else if (deleteTarget.type === "Teacher" && deleteTarget.id) {
        await API.delete(`/delete-teacher/${deleteTarget.id}`);
        setTeachers((prev) => prev.filter((t) => t._id !== deleteTarget.id));
        setFilteredTeachers((prev) =>
          prev.filter((t) => t._id !== deleteTarget.id)
        );
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setDeleteOpen(false);
    }
  };

  return (
    <div className="p-4 px-20 flex flex-col gap-4 w-full">
      {/* ------------------ Stat Cards ------------------ */}
      <div className="flex gap-4">
        <StatCard
          title="Students"
          value={students.length}
          icon={Users}
          color="blue"
          description={
            students.length
              ? `+${students.length} total students`
              : "No students available"
          }
          footer="Last updated just now"
        />
        {role === "Principal" && (
          <StatCard
            title="Teachers"
            value={teachers.length}
            icon={GraduationCap}
            color="green"
            description={
              teachers.length
                ? `+${teachers.length} total teachers`
                : "No teachers available"
            }
            footer="Last updated just now"
          />
        )}
      </div>

      {/* ------------------ Tabs ------------------ */}
      <Tabs defaultValue="students" className="gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="students">Students</TabsTrigger>
          {role === "Principal" && (
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
          )}
        </TabsList>

        {/* ------------------ Students Tab ------------------ */}
        <TabsContent value="students" className="p-4 flex flex-col gap-4">
          <StudentControls
            onSearch={handleStudentSearch}
            onSortName={handleSortStudentName}
            onSortRegister={handleSortStudentRegister}
            onAdd={() => {
              setSelectedStudent(null); // Clear selected student
              setStudentDrawerOpen(true);
            }}
          />
          {filteredStudents.length ? (
            <StudentTable
              data={filteredStudents}
              onDelete={(id) => {
                setDeleteTarget({ type: "Student", id });
                setDeleteOpen(true);
              }}
              onEdit={(student) => {
                setSelectedStudent(student);
                setStudentDrawerOpen(true);
              }}
            />
          ) : (
            <p className="text-center text-gray-500">No students found.</p>
          )}
        </TabsContent>

        {/* ------------------ Teachers Tab ------------------ */}
        {role === "Principal" && (
          <TabsContent value="teachers" className="p-4 flex flex-col gap-4">
            <TeacherControls
              onSearch={handleTeacherSearch}
              onSortName={handleSortTeacherName}
              onSortDepartment={handleSortTeacherDepartment}
              onFilterRole={handleFilterTeacherRole}
              onAdd={() => {
                setSelectedTeacher(null);
                setTeacherDrawerOpen(true);
              }}
            />
            {filteredTeachers.length ? (
              <TeacherTable
                data={filteredTeachers}
                onDelete={(id) => {
                  setDeleteTarget({ type: "Teacher", id });
                  setDeleteOpen(true);
                }}
                onEdit={(teacher) => {
                  setSelectedTeacher(teacher);
                  setTeacherDrawerOpen(true);
                }}
              />
            ) : (
              <p className="text-center text-gray-500">No teachers found.</p>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* ------------------ Drawers ------------------ */}
      <StudentCreateDrawer
        open={studentDrawerOpen}
        onOpenChange={(open) => {
          setStudentDrawerOpen(open);
          if (!open) setSelectedStudent(null); // reset after close
        }}
        student={selectedStudent}
        onSuccess={() => {
          // You might want to re-fetch students here
        }}
      />
      <TeacherCreateDrawer
        open={teacherDrawerOpen}
        onOpenChange={(open) => {
          setTeacherDrawerOpen(open);
          // FIX 2: Reset selectedTeacher on close, not student
          if (!open) setSelectedTeacher(null);
        }}
        teacher={selectedTeacher}
      />

      {/* ------------------ Delete Alert ------------------ */}
      <DeleteAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        entityName={deleteTarget.type}
      />
    </div>
  );
}
