// src/components/assignment/AssignmentUpdateForm.tsx
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
  Assignment,
  AssignmentItem,
  UpdateAssignmentData
} from "@/types/assignment";
import {
  getDepartmentsForAssignment,
  getCoursesByDepartment,
  getSemestersByCourse,
  updateAssignment
} from "@/services/assignmentService";

interface AssignmentUpdateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  assignment: Assignment | null;
  assignmentItem: AssignmentItem | null;
}

export default function AssignmentUpdateForm({
  open,
  onOpenChange,
  onSuccess,
  assignment,
  assignmentItem,
}: AssignmentUpdateFormProps) {
  // Form data
  const [formData, setFormData] = useState<UpdateAssignmentData>({
    oldCourse: "",
    oldSemester: "",
    newCourse: "",
    newSemester: "",
  });

  // Local state for department ID
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  // Dropdown options
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  // Initialize form data when assignment changes
  useEffect(() => {
    if (open && assignment && assignmentItem) {
      setFormData({
        oldCourse: assignmentItem.course._id,
        oldSemester: assignmentItem.semester._id,
        newCourse: "",
        newSemester: "",
      });
    }
  }, [open, assignment, assignmentItem]);

  // Fetch initial data
  useEffect(() => {
    if (open) {
      fetchInitialData();
    }
  }, [open]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const depts = await getDepartmentsForAssignment();
      setDepartments(depts);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      oldCourse: "",
      oldSemester: "",
      newCourse: "",
      newSemester: "",
    });
    setSelectedDepartmentId("");
    setCourses([]);
    setSemesters([]);
  };

  const handleDepartmentChange = async (departmentId: string) => {
    setSelectedDepartmentId(departmentId);
    setFormData(prev => ({
      ...prev,
      newCourse: "",
      newSemester: ""
    }));
    setCourses([]);
    setSemesters([]);

    if (!departmentId) return;

    try {
      const coursesData = await getCoursesByDepartment(departmentId);
      setCourses(coursesData);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const handleCourseChange = async (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      newCourse: courseId,
      newSemester: ""
    }));
    setSemesters([]);

    if (!courseId) return;

    try {
      const semestersData = await getSemestersByCourse(courseId);
      setSemesters(semestersData);
    } catch (error) {
      console.error("Failed to fetch semesters:", error);
    }
  };

  const handleSemesterChange = (semesterId: string) => {
    setFormData(prev => ({
      ...prev,
      newSemester: semesterId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.newCourse || !formData.newSemester) {
      alert("Please select new course and semester");
      return;
    }

    if (!assignment) {
      alert("Assignment not found");
      return;
    }

    setSubmitting(true);
    try {
      await updateAssignment(assignment.teacher._id, formData);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to update assignment:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to update assignment. Please try again.");
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
            <DialogTitle className="sr-only">Loading Update Form</DialogTitle>
            <DialogDescription className="sr-only">Please wait while the form loads</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!assignment || !assignmentItem) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="sr-only">No Assignment Selected</DialogTitle>
            <DialogDescription className="sr-only">No assignment data available</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">No assignment selected</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Assignment</DialogTitle>
          <DialogDescription>
            Update the course and semester assignment for {assignment.teacher.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Assignment Display */}
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium text-gray-700">Current Assignment</Label>
            <div className="text-sm text-gray-600">
              <div><strong>Course:</strong> {assignmentItem.course.courseName}</div>
              <div><strong>Semester:</strong> {assignmentItem.semester.name}</div>
            </div>
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

          {/* New Course Selection */}
          <div className="space-y-2">
            <Label htmlFor="course">New Course</Label>
            <Select
              value={formData.newCourse}
              onValueChange={handleCourseChange}
              disabled={!selectedDepartmentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a new course" />
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

          {/* New Semester Selection */}
          <div className="space-y-2">
            <Label htmlFor="semester">New Semester</Label>
            <Select
              value={formData.newSemester}
              onValueChange={handleSemesterChange}
              disabled={!formData.newCourse}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a new semester" />
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
              {submitting ? "Updating..." : "Update Assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


