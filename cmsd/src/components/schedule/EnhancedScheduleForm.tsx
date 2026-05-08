// src/components/schedule/EnhancedScheduleForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  GraduationCap
} from "lucide-react";
import { 
  addSchedule, 
  getTeacherAssignments, 
  checkScheduleConflicts 
} from "@/services/scheduleService";
import { getTeachersForAssignment, getSemestersByCourse } from "@/services/assignmentService";
import { fetchCourses } from "@/services/courseService";
import type { 
  ScheduleFormData, 
  ScheduleConflict, 
  TeacherAssignment 
} from "@/types/schedule";
import { WEEK_DAYS, TIME_SLOTS } from "@/types/schedule";

interface EnhancedScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EnhancedScheduleForm({ open, onOpenChange, onSuccess }: EnhancedScheduleFormProps) {
  const [formData, setFormData] = useState<ScheduleFormData>({
    teacherId: "",
    day: "",
    courseId: "",
    semesterId: "",
    subjectId: "",
    startTime: "",
    endTime: ""
  });

  // Add state for course and semester selection
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [availableSemesters, setAvailableSemesters] = useState<any[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState<boolean>(false);

  const [teachers, setTeachers] = useState<any[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>([]);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [checkingConflicts, setCheckingConflicts] = useState(false);

  // Fetch initial data
  useEffect(() => {
    if (open) {
      fetchInitialData();
    }
  }, [open]);

  // Check conflicts when time changes
  useEffect(() => {
    if (formData.teacherId && formData.day && formData.startTime && formData.endTime) {
      checkConflicts();
    } else {
      setConflicts([]);
    }
  }, [formData.teacherId, formData.day, formData.startTime, formData.endTime]);

  const fetchInitialData = async () => {
    setFetchingData(true);
    try {
      const [teachersData, coursesData] = await Promise.all([
        getTeachersForAssignment(),
        fetchCourses()
      ]);
      
      
      setTeachers(teachersData);
      setAvailableCourses(coursesData);
      
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    } finally {
      setFetchingData(false);
    }
  };

  const fetchTeacherAssignments = async (teacherId: string) => {
    try {
      const assignments = await getTeacherAssignments(teacherId);
      console.log(`🔍 Teacher ${teacherId} assignments:`, assignments);
      setTeacherAssignments(assignments);
    } catch (error) {
      console.error("Failed to fetch teacher assignments:", error);
      setTeacherAssignments([]);
    }
  };

  const checkConflicts = async () => {
    if (!formData.teacherId || !formData.day || !formData.startTime || !formData.endTime) {
      return;
    }

    setCheckingConflicts(true);
    try {
      const conflictResults = await checkScheduleConflicts(
        formData.teacherId,
        formData.day,
        formData.startTime,
        formData.endTime
      );
      setConflicts(conflictResults);
    } catch (error) {
      console.error("Failed to check conflicts:", error);
      setConflicts([]);
    } finally {
      setCheckingConflicts(false);
    }
  };

  const handleCourseChange = async (courseId: string) => {
    console.log("🔄 Course changed to:", courseId);
    setFormData(prev => ({
      ...prev,
      courseId,
      semesterId: "",
      subjectId: "",
      startTime: "",
      endTime: ""
    }));
    setAvailableSemesters([]);
    
    if (courseId) {
      setLoadingSemesters(true);
      try {
        console.log("🔄 Fetching semesters for course:", courseId);
        const semesters = await getSemestersByCourse(courseId);
        console.log("✅ Semesters fetched:", semesters);
        setAvailableSemesters(semesters || []);
      } catch (error) {
        console.error("❌ Failed to fetch semesters:", error);
        setAvailableSemesters([]);
      } finally {
        setLoadingSemesters(false);
      }
    }
  };

  const handleSemesterChange = (semesterId: string) => {
    setFormData(prev => ({
      ...prev,
      semesterId,
      subjectId: "",
      startTime: "",
      endTime: ""
    }));
  };

  const handleTeacherChange = async (teacherId: string) => {
    setFormData(prev => ({
      ...prev,
      teacherId,
      subjectId: "",
      startTime: "",
      endTime: ""
    }));
    
    if (teacherId) {
      await fetchTeacherAssignments(teacherId);
    } else {
      setTeacherAssignments([]);
    }
  };


  const handleTimeChange = (startTime: string) => {
    // Calculate end time (assuming 1-hour classes)
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + 1;
    const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    setFormData(prev => ({
      ...prev,
      startTime,
      endTime
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if there are any conflicts
    if (conflicts.length > 0) {
      alert("Cannot create schedule due to conflicts. Please resolve them first.");
      return;
    }

    setLoading(true);
    try {
      await addSchedule(formData);
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create schedule:", error);
      alert("Failed to create schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      teacherId: "",
      day: "",
      courseId: "",
      semesterId: "",
      subjectId: "",
      startTime: "",
      endTime: ""
    });
    setTeacherAssignments([]);
    setConflicts([]);
  };

  const isFormValid = formData.courseId && formData.semesterId && 
                     formData.teacherId && formData.subjectId && formData.day && 
                     formData.startTime && formData.endTime;

  const hasConflicts = conflicts.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Create Teacher Schedule
          </DialogTitle>
          <DialogDescription>
            Schedule a teacher for a specific subject with conflict detection
          </DialogDescription>
        </DialogHeader>

        {fetchingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading form data...</span>
          </div>
        ) : (

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Course Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                Select Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="course" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Course ({availableCourses.length} available)
                </Label>
                <Select
                  value={formData.courseId}
                  onValueChange={handleCourseChange}
                  disabled={fetchingData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((course) => (
                      <SelectItem key={course._id} value={course._id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{course.courseName || course.name || course.course_name || 'Unknown Course'}</span>
                          {course.name && course.name !== (course.courseName || course.course_name) && (
                            <span className="text-sm text-gray-500">{course.name}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Semester Selection */}
          {formData.courseId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  Select Semester
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="semester" className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Semester ({availableSemesters.length} available)
                  </Label>
                  <Select
                    value={formData.semesterId}
                    onValueChange={handleSemesterChange}
                    disabled={!formData.courseId || loadingSemesters}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingSemesters ? "Loading semesters..." : "Choose a semester"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSemesters.map((semester) => (
                        <SelectItem key={semester._id} value={semester._id}>
                          {semester.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Teacher Selection */}
          {formData.semesterId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  Select Teacher
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="teacher" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Teacher ({teachers.length} available)
                  </Label>
                  <Select
                    value={formData.teacherId}
                    onValueChange={handleTeacherChange}
                    disabled={!formData.semesterId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher._id} value={teacher._id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{teacher.name}</span>
                            <Badge variant="secondary" className="ml-2">
                              {teacher.employee_id || 'No ID'}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Subject Selection */}
          {formData.teacherId && formData.courseId && formData.semesterId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold">4</span>
                  </div>
                  Select Subject Assignment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teacherAssignments.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50">
                    <BookOpen className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-orange-900 mb-2">
                      No Subject Assignments Found
                    </h3>
                    <p className="text-orange-700 mb-4">
                      This teacher doesn't have any subject assignments yet.
                    </p>
                    <p className="text-sm text-orange-600">
                      Go to the <strong>Assignments</strong> tab to assign subjects first.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Available Subject Assignments
                    </Label>
                    <Select
                      value={`${formData.courseId}-${formData.semesterId}-${formData.subjectId}`}
                      onValueChange={(value) => {
                        const [courseId, semesterId, subjectId] = value.split('-');
                        setFormData(prev => ({
                          ...prev,
                          courseId,
                          semesterId,
                          subjectId
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a subject assignment" />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherAssignments.map((assignment, index) => (
                          <SelectItem 
                            key={index} 
                            value={`${assignment.course._id}-${assignment.semester._id}-${assignment.subject._id}`}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {assignment.subject.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {assignment.course.name} - {assignment.semester.name}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Schedule Details */}
          {formData.teacherId && formData.subjectId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  Schedule Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Day Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="day" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Day
                    </Label>
                    <Select
                      value={formData.day}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, day: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {WEEK_DAYS.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Time Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Start Time
                    </Label>
                    <Select
                      value={formData.startTime}
                      onValueChange={handleTimeChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* End Time Display */}
                  {formData.startTime && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        End Time
                      </Label>
                      <div className="p-3 bg-gray-50 rounded-md border">
                        <span className="font-medium">{formData.endTime}</span>
                        <span className="text-sm text-gray-500 ml-2">(1 hour duration)</span>
                      </div>
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>
          )}

          {/* Conflict Detection */}
          {formData.teacherId && formData.day && formData.startTime && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {checkingConflicts ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : hasConflicts ? (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  Conflict Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                {checkingConflicts ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking for conflicts...
                  </div>
                ) : hasConflicts ? (
                  <div className="space-y-3">
                    {conflicts.map((conflict, index) => (
                      <Alert key={index} className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <strong>Teacher Conflict:</strong>{" "}
                          {conflict.message}
                          <div className="mt-2 text-sm">
                            <strong>Conflicting Schedule:</strong>
                            <ul className="list-disc list-inside mt-1">
                              <li>Subject: {conflict.conflictingSchedule.subject}</li>
                              <li>Day: {conflict.conflictingSchedule.day}</li>
                              <li>Time: {conflict.conflictingSchedule.startTime} - {conflict.conflictingSchedule.endTime}</li>
                              {conflict.conflictingSchedule.teacher && (
                                <li>Teacher: {conflict.conflictingSchedule.teacher}</li>
                              )}
                            </ul>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    No conflicts detected. Schedule is available.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || loading || fetchingData || hasConflicts}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Creating..." : "Create Schedule"}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}


