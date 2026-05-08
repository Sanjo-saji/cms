// src/pages/teacherAssign.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MobileAssignmentForm from "@/components/assignment/MobileAssignmentForm";
import AssignmentUpdateForm from "@/components/assignment/AssignmentUpdateForm";
import EnhancedScheduleForm from "@/components/schedule/EnhancedScheduleForm";
import EnhancedScheduleList from "@/components/schedule/EnhancedScheduleList";
import type { Assignment, AssignmentItem } from "@/types/assignment";
import type { TeacherSchedule } from "@/types/schedule";
import {
  getExistingAssignments,
  deleteAssignment,
  getSubjectsByCourseAndSemester
} from "@/services/assignmentService";
import {
  getAllSchedules,
  deleteSchedule,
  getScheduleStats
} from "@/services/scheduleService";
import { getUserRole } from "@/lib/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus, Users, BookOpen, GraduationCap, Trash2, Calendar, Clock } from "lucide-react";

export default function TeacherAssign() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [updateFormOpen, setUpdateFormOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedAssignmentItem, setSelectedAssignmentItem] = useState<AssignmentItem | null>(null);
  const [assignmentSubjects, setAssignmentSubjects] = useState<{[key: string]: any[]}>({});
  const [activeTab, setActiveTab] = useState("assignments");
  const [schedules, setSchedules] = useState<TeacherSchedule[]>([]);
  const [scheduleFormOpen, setScheduleFormOpen] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleStats, setScheduleStats] = useState({
    totalSchedules: 0,
    activeTeachers: 0,
    weeklyClasses: 0,
    timeSlots: 0
  });
  const [stats, setStats] = useState({
    totalAssignments: 0,
    totalTeachers: 0,
    totalSubjects: 0
  });

  const role = getUserRole();
  const isMobile = useIsMobile();


  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    console.log("🔄 Tab changed to:", activeTab);
    if (activeTab === "schedule") {
      console.log("📅 Schedule tab activated, fetching schedules...");
      fetchSchedules();
    } else {
      console.log("📋 Non-schedule tab activated, skipping schedule fetch");
    }
  }, [activeTab]);

  const fetchSubjectsForAssignments = async (assignments: Assignment[]) => {
    const subjectsMap: {[key: string]: any[]} = {};
    
    console.log("Fetching subjects for assignments:", assignments);
    
    for (const assignment of assignments) {
      for (const item of assignment.assignments || []) {
        if (item.course?._id && item.semester?._id) {
          const key = `${item.course._id}-${item.semester._id}`;
          console.log(`Processing assignment: ${item.course.name} - ${item.semester.name} (${key})`);
          
          if (!subjectsMap[key]) {
            try {
              const subjects = await getSubjectsByCourseAndSemester(item.course._id, item.semester._id);
              console.log(`Found ${subjects.length} subjects for ${key}:`, subjects);
              subjectsMap[key] = subjects;
            } catch (error) {
              console.error(`Failed to fetch subjects for ${key}:`, error);
              subjectsMap[key] = [];
            }
          }
        }
      }
    }
    
    console.log("Final subjects map:", subjectsMap);
    setAssignmentSubjects(subjectsMap);
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await getExistingAssignments();
      console.log("Raw assignments data from server:", data);
      
      // Filter out teachers with no assignments
      const filteredData = data.filter(assignment => 
        assignment.assignments && 
        Array.isArray(assignment.assignments) && 
        assignment.assignments.length > 0
      );
      
      console.log("Filtered assignments data:", filteredData);
      setAssignments(filteredData);
      
      // Fetch subjects for all assignments
      await fetchSubjectsForAssignments(filteredData);

      // Calculate stats with proper error handling using filtered data
      const uniqueTeachers = new Set(
        filteredData
          .filter(a => a.teacher && a.teacher._id)
          .map(a => a.teacher._id)
      ).size;
      
      // Since assignments don't have subjects, count unique course-semester combinations
      const uniqueCourseSemesters = new Set(
        filteredData
          .flatMap(a => a.assignments || [])
          .filter(item => item.course && item.semester)
          .map(item => `${item.course._id}-${item.semester._id}`)
      ).size;

      setStats({
        totalAssignments: filteredData.length,
        totalTeachers: uniqueTeachers,
        totalSubjects: uniqueCourseSemesters
      });
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
      // Show empty state when API fails
      setAssignments([]);
      setStats({
        totalAssignments: 0,
        totalTeachers: 0,
        totalSubjects: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (teacherId: string, courseId: string, semesterId: string, subjectId?: string) => {
    // Find the assignment details for confirmation
    const assignment = assignments.find(a => a.teacher._id === teacherId);
    const assignmentItem = assignment?.assignments.find(item => 
      item.course._id === courseId && item.semester._id === semesterId
    );
    
    if (!assignmentItem) {
      alert("Assignment not found");
      return;
    }

    const confirmMessage = `Are you sure you want to delete this assignment?\n\nTeacher: ${assignment?.teacher?.name || 'Unknown'}\nCourse: ${assignmentItem.course.name}\nSemester: ${assignmentItem.semester.name}${assignmentItem.subject ? `\nSubject: ${assignmentItem.subject.name}` : ''}`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await deleteAssignment(teacherId, { 
        course: courseId, 
        semester: semesterId, 
        subject: subjectId || assignmentItem.subject?._id 
      });
      
      // Update local state immediately for better UX
      setAssignments(prev => {
        const updatedAssignments = prev.map(assignment => {
          if (assignment.teacher._id === teacherId) {
            const filteredAssignments = assignment.assignments.filter(item => 
              !(item.course._id === courseId && item.semester._id === semesterId)
            );
            
            // Return the assignment with filtered items, or null if no assignments left
            return filteredAssignments.length > 0 ? {
              ...assignment,
              assignments: filteredAssignments
            } : null;
          }
          return assignment;
        }).filter((assignment): assignment is Assignment => 
          assignment !== null && assignment.assignments && assignment.assignments.length > 0
        ); // Remove teachers with no assignments
        
        console.log("Updated assignments after delete:", updatedAssignments);
        return updatedAssignments;
      });
      
      // Refresh assignments to ensure data consistency
      setTimeout(() => {
        fetchAssignments();
      }, 100);
    } catch (error) {
      console.error("Failed to delete assignment:", error);
      alert("Failed to delete assignment. Please try again.");
    }
  };

  const handleAssignmentSuccess = () => {
    fetchAssignments(); // Refresh the list and stats
  };

  const fetchSchedules = async () => {
    console.log("🚀 Starting fetchSchedules...");
    setScheduleLoading(true);
    try {
      console.log("📡 Calling getAllSchedules and getScheduleStats...");
      const [schedulesData, statsData] = await Promise.all([
        getAllSchedules(),
        getScheduleStats()
      ]);
      console.log("📋 Received schedules data:", schedulesData);
      console.log("📊 Received schedule stats:", statsData);
      
      console.log("🔄 Setting schedules state...");
      setSchedules(schedulesData);
      console.log("🔄 Setting schedule stats state...");
      setScheduleStats(statsData);
      
      console.log("✅ Schedule data updated successfully");
    } catch (error) {
      console.error("❌ Failed to fetch schedules:", error);
    } finally {
      console.log("🏁 Setting scheduleLoading to false");
      setScheduleLoading(false);
    }
  };

  const handleScheduleSuccess = () => {
    fetchSchedules(); // Refresh the list and stats
  };

  const handleDeleteSchedule = async (teacherId: string, day: string, course: string, semester: string, subject: string) => {
    const confirmMessage = `Are you sure you want to delete this schedule entry?\n\nDay: ${day}\nCourse: ${course}\nSemester: ${semester}\nSubject: ${subject}`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await deleteSchedule(teacherId, { day, course, semester, subject });
      fetchSchedules(); // Refresh schedules
    } catch (error) {
      console.error("Failed to delete schedule:", error);
      alert("Failed to delete schedule. Please try again.");
    }
  };


  const handleUpdateSuccess = () => {
    fetchAssignments(); // Refresh the list and stats
    setUpdateFormOpen(false);
    setSelectedAssignment(null);
    setSelectedAssignmentItem(null);
  };

  if (role !== "Principal") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">Access Denied</CardTitle>
              <CardDescription>
                Only Principals can access the teacher assignment feature.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Remove error state - we'll handle errors gracefully

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full px-4 py-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Teacher Management
              </h1>
              <p className="text-gray-600">
                Manage teacher assignments and schedules across all departments
              </p>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assignments" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Assignments
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule
              </TabsTrigger>
            </TabsList>

            {/* Assignments Tab */}
            <TabsContent value="assignments" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Teacher Assignments
                  </h2>
                  <p className="text-gray-600">
                    Manage teacher-subject assignments across all departments
                  </p>
                </div>
                <Button
                  onClick={() => setFormOpen(true)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                  size={isMobile ? "default" : "lg"}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isMobile ? "Assign Teacher" : "New Assignment"}
                </Button>
              </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                    <div className="text-2xl font-bold text-gray-900">
                      {loading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        stats.totalAssignments
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                    <div className="text-2xl font-bold text-gray-900">
                      {loading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        stats.totalTeachers
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Course-Semester Pairs</p>
                    <div className="text-2xl font-bold text-gray-900">
                      {loading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        stats.totalSubjects
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assignments List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Current Assignments
              </CardTitle>
              <CardDescription>
                View and manage all teacher-subject assignments
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No assignments found
                  </h3>
                  <p className="text-gray-500">
                    Create your first assignment to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {assignments.map((assignment, index) => (
                    <div key={assignment._id || `assignment-${index}`} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      {/* Teacher Header */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                {(assignment.teacher?.name || 'U').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {assignment.teacher?.name || 'Unknown Teacher'}
                              </h3>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {(assignment.assignments || []).length} Assignment{(assignment.assignments || []).length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Assignments List */}
                      <div className="p-6">
                        <div className="space-y-3">
                          {(assignment.assignments || []).map((item, index) => {
                            const subjectsKey = `${item.course?._id}-${item.semester?._id}`;
                            const subjects = assignmentSubjects[subjectsKey] || [];
                            
                            return (
                              <div key={`${item.course._id}-${item.semester._id}-${index}`} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                                      <BookOpen className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900">
                                        {item.course?.name || 'Unknown Course'}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {item.semester?.name || 'Unknown Semester'}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteAssignment(
                                      assignment.teacher._id, 
                                      item.course._id, 
                                      item.semester._id,
                                      item.subject?._id
                                    )}
                                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                                
                                {/* Subjects List */}
                                <div className="ml-14">
                                  <p className="text-xs font-medium text-gray-500 mb-2">Subjects:</p>
                                  {subjects.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {subjects.map((subject, subIndex) => (
                                        <span 
                                          key={subject._id || `subject-${subIndex}`}
                                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                                        >
                                          {subject.name}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-gray-400 italic">No subjects found</span>
                                      <button 
                                        onClick={() => {
                                          const key = `${item.course?._id}-${item.semester?._id}`;
                                          console.log(`Manual retry for ${key}`);
                                          // Retry fetching subjects for this specific combination
                                          getSubjectsByCourseAndSemester(item.course._id, item.semester._id)
                                            .then(newSubjects => {
                                              setAssignmentSubjects(prev => ({
                                                ...prev,
                                                [key]: newSubjects
                                              }));
                                            })
                                            .catch(err => console.error("Retry failed:", err));
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                                      >
                                        Retry
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Enhanced Teacher Schedules
                  </h2>
                  <p className="text-gray-600">
                    Manage teacher schedules with conflict detection and classroom assignment
                  </p>
                </div>
                <Button
                  onClick={() => setScheduleFormOpen(true)}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                  size={isMobile ? "default" : "lg"}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isMobile ? "Add Schedule" : "New Schedule"}
                </Button>
              </div>

              {/* Schedule Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Schedules</p>
                        <div className="text-2xl font-bold text-gray-900">
                          {scheduleLoading ? <Skeleton className="h-8 w-16" /> : scheduleStats.totalSchedules}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                        <div className="text-2xl font-bold text-gray-900">
                          {scheduleLoading ? <Skeleton className="h-8 w-16" /> : scheduleStats.activeTeachers}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Weekly Classes</p>
                        <div className="text-2xl font-bold text-gray-900">
                          {scheduleLoading ? <Skeleton className="h-8 w-16" /> : scheduleStats.weeklyClasses}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Users className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Time Slots</p>
                        <div className="text-2xl font-bold text-gray-900">
                          {scheduleLoading ? <Skeleton className="h-8 w-16" /> : scheduleStats.timeSlots}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Schedule List */}
              {scheduleLoading ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Schedule</CardTitle>
                    <CardDescription>
                      Loading schedule data...
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <EnhancedScheduleList 
                  schedules={schedules.filter(schedule => 
                    schedule.schedule && 
                    Array.isArray(schedule.schedule) && 
                    schedule.schedule.length > 0 &&
                    schedule.schedule.some(day => day.contents && day.contents.length > 0)
                  )}
                  onDelete={handleDeleteSchedule}
                />
              )}
            </TabsContent>
          </Tabs>

        {/* Assignment Form Dialog */}
        <MobileAssignmentForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSuccess={handleAssignmentSuccess}
        />

        {/* Assignment Update Form Dialog */}
        <AssignmentUpdateForm
          open={updateFormOpen}
          onOpenChange={setUpdateFormOpen}
          onSuccess={handleUpdateSuccess}
          assignment={selectedAssignment}
          assignmentItem={selectedAssignmentItem}
        />

        {/* Enhanced Schedule Form Dialog */}
        <EnhancedScheduleForm
          open={scheduleFormOpen}
          onOpenChange={setScheduleFormOpen}
          onSuccess={handleScheduleSuccess}
        />
        </div>
      </div>
    </div>
  );
}
