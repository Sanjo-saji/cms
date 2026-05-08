// src/components/assignment/AssignmentForm.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  Department,
  Course,
  Semester,
  Subject,
  Teacher,
  AssignmentFormData
} from "@/types/assignment";
import {
  getDepartmentsForAssignment,
  getCoursesByDepartment,
  getSemestersByCourse,
  getSubjectsByCourseAndSemester,
  getTeachersForAssignment,
  createAssignment
} from "@/services/assignmentService";

interface AssignmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AssignmentForm({
  open,
  onOpenChange,
  onSuccess,
}: AssignmentFormProps) {
  // Form data
  const [formData, setFormData] = useState<AssignmentFormData>({
    teacherId: "",
    courseId: "",
    semesterId: "",
    subjectId: "",
    department: "",
  });

  // Local state for department ID
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  // Dropdown options
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  // Fetch initial data
  useEffect(() => {
    if (open) {
      fetchInitialData();
    }
  }, [open]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [depts, teachs] = await Promise.all([
        getDepartmentsForAssignment(),
        getTeachersForAssignment(),
      ]);
      setDepartments(depts);
      setTeachers(teachs);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      teacherId: "",
      courseId: "",
      semesterId: "",
      subjectId: "",
      department: "",
    });
    setSelectedDepartmentId("");
    setCourses([]);
    setSemesters([]);
    setSubjects([]);
  };

  const handleDepartmentChange = async (departmentId: string) => {
    setSelectedDepartmentId(departmentId);
    setFormData(prev => ({
      ...prev,
      departmentId: departmentId,
      courseId: "",
      semesterId: "",
      subjectId: ""
    }));
    setCourses([]);
    setSemesters([]);
    setSubjects([]);

    if (!departmentId) return;

    try {
      const selectedDept = departments.find(d => d._id === departmentId);
      if (selectedDept) {
        setFormData(prev => ({ ...prev, department: selectedDept.name }));
      }

      const coursesData = await getCoursesByDepartment(departmentId);
      setCourses(coursesData);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const handleCourseChange = async (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      courseId,
      semesterId: "",
      subjectId: ""
    }));
    setSemesters([]);
    setSubjects([]);

    if (!courseId) return;

    try {
      const semestersData = await getSemestersByCourse(courseId);
      setSemesters(semestersData);
    } catch (error) {
      console.error("Failed to fetch semesters:", error);
    }
  };

  const handleSemesterChange = async (semesterId: string) => {
    setFormData(prev => ({
      ...prev,
      semesterId,
      subjectId: ""
    }));
    setSubjects([]);

    if (!semesterId || !formData.courseId) return;

    try {
      const subjectsData = await getSubjectsByCourseAndSemester(
        formData.courseId,
        semesterId
      );
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.teacherId || !formData.courseId || !formData.semesterId ||
        !formData.subjectId || !formData.department) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      await createAssignment(formData);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to create assignment:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to create assignment. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="sr-only">Loading Assignment Form</DialogTitle>
            <DialogDescription className="sr-only">Please wait while the form loads</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Teacher to Subject</DialogTitle>
          <DialogDescription>
            Select a teacher and assign them to a specific subject.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Teacher Selection */}
          <div className="space-y-2">
            <Label htmlFor="teacher">Teacher</Label>
            <Select
              value={formData.teacherId}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, teacherId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher._id} value={teacher._id}>
                    {teacher.name} ({teacher.employee_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Selection */}
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={selectedDepartmentId}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Course Selection */}
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select
              value={formData.courseId}
              onValueChange={handleCourseChange}
              disabled={!selectedDepartmentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.courseName} ({course.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Semester Selection */}
          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Select
              value={formData.semesterId}
              onValueChange={handleSemesterChange}
              disabled={!formData.courseId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester._id} value={semester._id}>
                    {semester.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={formData.subjectId}
              onValueChange={(value) =>
                setFormData(prev => ({ ...prev, subjectId: value }))
              }
              disabled={!formData.semesterId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject._id} value={subject._id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Assigning..." : "Assign Teacher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
