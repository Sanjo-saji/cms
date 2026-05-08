// src/components/assignment/MobileAssignmentForm.tsx
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
import { useIsMobile } from "@/hooks/use-mobile";
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
  createAssignment,
  checkSubjectAssignment,
  checkTeacherCourseSemesterAssignment
} from "@/services/assignmentService";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Building2,
  BookOpen,
  GraduationCap,
  UserCheck,
  CheckCircle
} from "lucide-react";

interface AssignmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const STEPS = [
  { id: 1, title: "Teacher", icon: Users, description: "Choose a teacher" },
  { id: 2, title: "Department", icon: Building2, description: "Choose department" },
  { id: 3, title: "Course", icon: BookOpen, description: "Choose course" },
  { id: 4, title: "Semester", icon: GraduationCap, description: "Choose semester" },
  { id: 5, title: "Subject", icon: UserCheck, description: "Choose subject" },
  { id: 6, title: "Review", icon: CheckCircle, description: "Review & submit" }
];

export default function MobileAssignmentForm({
  open,
  onOpenChange,
  onSuccess,
}: AssignmentFormProps) {
  const isMobile = useIsMobile();

  // Form data
  const [formData, setFormData] = useState<AssignmentFormData>({
    teacherId: "",
    courseId: "",
    semesterId: "",
    subjectId: "",
    department: "",
  });

  // Current step in the wizard
  const [currentStep, setCurrentStep] = useState(1);

  // Dropdown options
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState<{
    subject?: string;
    teacher?: string;
  }>({});
  const [checkingValidation, setCheckingValidation] = useState(false);

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
    setCurrentStep(1);
    setCourses([]);
    setSemesters([]);
    setSubjects([]);
    setValidationErrors({});
  };

  // Validate assignment before submission
  const validateAssignment = async (): Promise<boolean> => {
    if (!formData.teacherId || !formData.courseId || !formData.semesterId || !formData.subjectId) {
      return false;
    }

    setCheckingValidation(true);
    setValidationErrors({});

    try {
      // Check if subject is already assigned to another teacher
      const subjectCheck = await checkSubjectAssignment(
        formData.subjectId,
        formData.courseId,
        formData.semesterId
      );

      if (subjectCheck.isAssigned) {
        setValidationErrors(prev => ({
          ...prev,
          subject: `This subject is already assigned to ${subjectCheck.assignedTeacher}`
        }));
        setCheckingValidation(false);
        return false;
      }

      // Check if teacher is already assigned to the same course-semester combination
      const teacherCheck = await checkTeacherCourseSemesterAssignment(
        formData.teacherId,
        formData.courseId,
        formData.semesterId
      );

      if (teacherCheck) {
        setValidationErrors(prev => ({
          ...prev,
          teacher: "This teacher is already assigned to this course-semester combination"
        }));
        setCheckingValidation(false);
        return false;
      }

      setCheckingValidation(false);
      return true;
    } catch (error) {
      console.error("Validation error:", error);
      setCheckingValidation(false);
      return false;
    }
  };

  const handleDepartmentChange = async (departmentId: string) => {
    const selectedDept = departments.find(d => d._id === departmentId);
    if (selectedDept) {
      setFormData(prev => ({ ...prev, department: selectedDept.name }));
    }

    setFormData(prev => ({
      ...prev,
      courseId: "",
      semesterId: "",
      subjectId: ""
    }));
    setCourses([]);
    setSemesters([]);
    setSubjects([]);

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

  const nextStep = async () => {
    if (currentStep < STEPS.length) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      // If moving to review step (step 6), validate the assignment
      if (newStep === 6) {
        await validateAssignment();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.teacherId;
      case 2: return formData.department;
      case 3: return formData.courseId;
      case 4: return formData.semesterId;
      case 5: return formData.subjectId;
      default: return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.teacherId || !formData.courseId || !formData.semesterId ||
        !formData.subjectId || !formData.department) {
      alert("Please fill in all fields");
      return;
    }

    // Validate assignment before submission
    const isValid = await validateAssignment();
    if (!isValid) {
      // Show validation errors
      if (validationErrors.subject) {
        alert(`Validation Error: ${validationErrors.subject}`);
      } else if (validationErrors.teacher) {
        alert(`Validation Error: ${validationErrors.teacher}`);
      }
      return;
    }

    // Get display names for confirmation
    const selectedTeacher = teachers.find(t => t._id === formData.teacherId);
    const selectedCourse = courses.find(c => c._id === formData.courseId);
    const selectedSemester = semesters.find(s => s._id === formData.semesterId);
    const selectedSubject = subjects.find(s => s._id === formData.subjectId);

    const confirmMessage = `Are you sure you want to assign this teacher to the selected subject?\n\nAssignment Details:\n- Teacher: ${selectedTeacher?.name}\n- Course: ${selectedCourse?.courseName}\n- Semester: ${selectedSemester?.name}\n- Subject: ${selectedSubject?.name}\n\nThis will create a new assignment.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setSubmitting(true);
    try {
      console.log("🎯 Submitting assignment:", formData);
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

  const renderStepContent = () => {
    const currentStepData = STEPS[currentStep - 1];
    const Icon = currentStepData.icon;

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {currentStepData.description}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Select Teacher</Label>
              <Select
                value={formData.teacherId}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, teacherId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher._id} value={teacher._id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{teacher.name}</span>
                        <span className="text-sm text-gray-500">{teacher.employee_id}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {currentStepData.description}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Select Department</Label>
              <Select
                value={formData.department}
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a department" />
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
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {currentStepData.description}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">Select Course</Label>
              <Select
                value={formData.courseId}
                onValueChange={handleCourseChange}
                disabled={!formData.department}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{course.courseName}</span>
                        <span className="text-sm text-gray-500">{course.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {currentStepData.description}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Select Semester</Label>
              <Select
                value={formData.semesterId}
                onValueChange={handleSemesterChange}
                disabled={!formData.courseId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a semester" />
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
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {currentStepData.description}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Select Subject</Label>
              <Select
                value={formData.subjectId}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, subjectId: value }))
                }
                disabled={!formData.semesterId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subject" />
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
          </div>
        );

      case 6:
        const selectedTeacher = teachers.find(t => t._id === formData.teacherId);
        const selectedCourse = courses.find(c => c._id === formData.courseId);
        const selectedSemester = semesters.find(s => s._id === formData.semesterId);
        const selectedSubject = subjects.find(s => s._id === formData.subjectId);

        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Review Assignment
              </h3>
              <p className="text-gray-600 text-sm">
                Please review the assignment details before submitting
              </p>
            </div>

            <div className="space-y-4">
              {/* Validation Errors */}
              {(validationErrors.subject || validationErrors.teacher) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-2">
                      <span className="text-red-600 text-xs font-bold">!</span>
                    </div>
                    <h4 className="font-medium text-red-800">Assignment Conflict Detected</h4>
                  </div>
                  {validationErrors.subject && (
                    <p className="text-red-700 text-sm mb-2">{validationErrors.subject}</p>
                  )}
                  {validationErrors.teacher && (
                    <p className="text-red-700 text-sm">{validationErrors.teacher}</p>
                  )}
                  <p className="text-red-600 text-xs mt-2">
                    Please go back and select different options to resolve the conflict.
                  </p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Teacher:</span>
                  <span className="text-gray-900">{selectedTeacher?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Department:</span>
                  <span className="text-gray-900">{formData.department}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Course:</span>
                  <span className="text-gray-900">{selectedCourse?.courseName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Semester:</span>
                  <span className="text-gray-900">{selectedSemester?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Subject:</span>
                  <span className="text-gray-900">{selectedSubject?.name}</span>
                </div>
              </div>

              {/* Validation Status */}
              {checkingValidation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-blue-700 text-sm">Checking for conflicts...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={isMobile ? "max-w-[95vw] w-full" : "sm:max-w-[500px]"}>
          <DialogHeader>
            <DialogTitle className="sr-only">Loading Assignment Form</DialogTitle>
            <DialogDescription className="sr-only">Please wait while the form loads</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={isMobile ? "max-w-[95vw] w-full max-h-[90vh] overflow-y-auto" : "sm:max-w-[600px]"}>
        <DialogHeader>
          <DialogTitle className="sr-only">Assign Teacher to Subject</DialogTitle>
          <DialogDescription className="sr-only">
            Select a teacher and assign them to a specific subject.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {STEPS.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}%
            </span>
          </div>
          {/* Custom Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex w-full gap-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}

            {currentStep < STEPS.length ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex-1"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || checkingValidation || validationErrors.subject || validationErrors.teacher}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Assigning...
                  </>
                ) : checkingValidation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Validating...
                  </>
                ) : validationErrors.subject || validationErrors.teacher ? (
                  <>
                    <span className="w-4 h-4 mr-2">⚠️</span>
                    Resolve Conflicts
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Assign Teacher
                  </>
                )}
              </Button>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
