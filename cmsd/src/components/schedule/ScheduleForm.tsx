// src/components/schedule/ScheduleForm.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, User, BookOpen, GraduationCap } from "lucide-react";
import { addSchedule } from "@/services/scheduleService";
import { getTeachersForAssignment, getExistingAssignments, getSubjectsByCourseAndSemester } from "@/services/assignmentService";
import type { ScheduleFormData } from "@/types/schedule";
import { WEEK_DAYS, TIME_SLOTS } from "@/types/schedule";

interface ScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ScheduleForm({ open, onOpenChange, onSuccess }: ScheduleFormProps) {
  const [formData, setFormData] = useState<ScheduleFormData>({
    teacherId: "",
    day: "",
    courseId: "",
    semesterId: "",
    subjectId: "",
    time: ""
  });

  const [teachers, setTeachers] = useState<any[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  // Fetch initial data
  useEffect(() => {
    if (open) {
      fetchInitialData();
    }
  }, [open]);

  const fetchInitialData = async () => {
    setFetchingData(true);
    try {
      const [teachersData, assignmentsData] = await Promise.all([
        getTeachersForAssignment(),
        getExistingAssignments()
      ]);
      
      console.log("🔍 All teachers data:", teachersData);
      console.log("🔍 Raw assignments data:", assignmentsData);
      console.log("🔍 Teachers data length:", teachersData.length);
      console.log("🔍 Assignments data length:", assignmentsData.length);
      
      setTeacherAssignments(assignmentsData);
      setTeachers(teachersData); // Show all teachers, not just those with assignments
      
      // Debug each assignment
      assignmentsData.forEach((assignment, index) => {
        console.log(`🔍 Assignment ${index}:`, {
          teacher: assignment.teacher?.name,
          assignments: assignment.assignments,
          assignmentsLength: assignment.assignments?.length || 0
        });
      });
      
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    } finally {
      setFetchingData(false);
    }
  };

  const handleTeacherChange = (teacherId: string) => {
    setFormData(prev => ({
      ...prev,
      teacherId,
      courseId: "",
      semesterId: "",
      subjectId: ""
    }));
  };

  const getTeacherAssignments = (teacherId: string) => {
    const teacherAssignment = teacherAssignments.find(assignment => assignment.teacher._id === teacherId);
    const assignments = teacherAssignment?.assignments || [];
    console.log(`🔍 Teacher ${teacherId} assignments:`, assignments);
    console.log(`🔍 Teacher assignment object:`, teacherAssignment);
    return assignments;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      time: ""
    });
  };

  const isFormValid = formData.teacherId && formData.day && formData.courseId && 
                     formData.semesterId && formData.subjectId && formData.time;

  // Add error boundary for the entire form
  if (!formData.teacherId) {
    console.log("🔍 Form state - no teacher selected");
  } else {
    console.log("🔍 Form state - teacher selected:", formData.teacherId);
    console.log("🔍 Form state - assignments available:", getTeacherAssignments(formData.teacherId).length);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Add New Schedule
          </DialogTitle>
          <DialogDescription>
            Create a new class schedule entry for a teacher
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Teacher Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              Select Teacher
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="teacher" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Teacher ({teachers.length} available)
              </Label>
              <Select
                value={formData.teacherId}
                onValueChange={handleTeacherChange}
                disabled={fetchingData}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => {
                    const hasAssignments = getTeacherAssignments(teacher._id).length > 0;
                    return (
                      <SelectItem key={teacher._id} value={teacher._id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{teacher.name}</span>
                          <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                            hasAssignments 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {hasAssignments ? 'Has Assignments' : 'No Assignments'}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Step 2: Assignment Selection */}
          {formData.teacherId && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                Select Assignment
              </div>
              
              {getTeacherAssignments(formData.teacherId).length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50">
                  <BookOpen className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">
                    No Assignments Found
                  </h3>
                  <p className="text-orange-700 mb-4">
                    This teacher doesn't have any course assignments yet.
                  </p>
                  <p className="text-sm text-orange-600">
                    Go to the <strong>Assignments</strong> tab to assign this teacher to courses first.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Course - Semester - Subject
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
                      <SelectValue placeholder="Choose an assignment" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        try {
                          const assignments = getTeacherAssignments(formData.teacherId);
                          console.log(`🔍 Rendering assignments for teacher ${formData.teacherId}:`, assignments);
                          
                          return assignments.map((assignment, index) => {
                            console.log(`🔍 Rendering assignment ${index}:`, assignment);
                            return (
                              <SelectItem 
                                key={index} 
                                value={`${assignment.course?._id || 'no-course'}-${assignment.semester?._id || 'no-semester'}-${assignment.subject?._id || 'no-subject'}`}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {assignment.course?.name || 'Unknown Course'} - {assignment.semester?.name || 'Unknown Semester'}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    Subject: {assignment.subject?.name || 'No subject assigned'}
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          });
                        } catch (error) {
                          console.error("Error rendering assignments:", error);
                          return (
                            <div className="p-4 text-center text-red-500">
                              Error loading assignments
                            </div>
                          );
                        }
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Schedule Details */}
          {formData.teacherId && formData.courseId && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                Schedule Details
              </div>
              
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

                {/* Time Selection */}
                <div className="space-y-2">
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time Slot
                  </Label>
                  <Select
                    value={formData.time}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
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
              </div>
            </div>
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
              disabled={!isFormValid || loading || fetchingData}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Creating..." : "Create Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
