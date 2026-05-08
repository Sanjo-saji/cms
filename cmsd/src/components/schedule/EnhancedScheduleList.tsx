// src/components/schedule/EnhancedScheduleList.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ChevronDown, 
  ChevronUp, 
  CalendarDays, 
  Clock, 
  BookOpen, 
  Trash2, 
  Edit,
  AlertTriangle,
  CheckCircle,
  Users
} from "lucide-react";
import type { TeacherSchedule, ScheduleClass, ScheduleDay } from "@/types/schedule";
import { WEEK_DAYS } from "@/types/schedule";

interface EnhancedScheduleListProps {
  schedules: TeacherSchedule[];
  onEdit?: (schedule: TeacherSchedule, scheduleClass: ScheduleClass) => void;
  onDelete?: (teacherId: string, day: string, course: string, semester: string, subject: string) => void;
}

export default function EnhancedScheduleList({ schedules, onEdit, onDelete }: EnhancedScheduleListProps) {
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  

  const toggleTeacherExpansion = (teacherId: string) => {
    setExpandedTeacher(expandedTeacher === teacherId ? null : teacherId);
  };

  const getDayColor = (day: string) => {
    const colors = {
      Monday: "bg-blue-100 text-blue-800 border-blue-200",
      Tuesday: "bg-green-100 text-green-800 border-green-200", 
      Wednesday: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Thursday: "bg-purple-100 text-purple-800 border-purple-200",
      Friday: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[day as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getTimeColor = (time: string) => {
    if (!time) return "bg-gray-100 text-gray-800 border-gray-200";
    const hour = parseInt(time.split(':')[0]);
    if (hour < 10) return "bg-green-100 text-green-800 border-green-200";
    if (hour < 14) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-orange-100 text-orange-800 border-orange-200";
  };

  const getConflictColor = (conflictType?: string) => {
    switch (conflictType) {
      case 'teacher':
        return "bg-red-100 text-red-800 border-red-200";
      case 'classroom':
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "Time not set";
    // Calculate end time (assuming 1-hour classes)
    const [hours, minutes] = time.split(':').map(Number);
    const endHours = hours + 1;
    const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return `${time} - ${endTime}`;
  };

  const getTotalClasses = (schedule: TeacherSchedule) => {
    return schedule.schedule?.reduce((total, day) => total + (day.contents?.length || 0), 0) || 0;
  };

  const getTotalHours = (schedule: TeacherSchedule) => {
    return schedule.schedule?.reduce((total, day) => {
      return total + (day.contents?.reduce((dayTotal, cls) => {
        // Since backend uses single time field, assume 1 hour per class
        return dayTotal + 1;
      }, 0) || 0);
    }, 0) || 0;
  };

  if (schedules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            Weekly Schedule
          </CardTitle>
          <CardDescription>
            View and manage teacher schedules for the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No schedules found
            </h3>
            <p className="text-gray-500">
              Create your first schedule to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {schedules.map((schedule) => (
        <Card key={schedule._id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleTeacherExpansion(schedule.teacher._id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {schedule.teacher.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-lg">{schedule.teacher.name}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {getTotalClasses(schedule)} classes
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {getTotalHours(schedule)} hours/week
                    </span>
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedTeacher === schedule.teacher._id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          {expandedTeacher === schedule.teacher._id && (
            <CardContent className="pt-0">
              <div className="space-y-4">
                {WEEK_DAYS.map((day) => {
                  const daySchedule = schedule.schedule?.find(d => d.day === day);
                  const classes = daySchedule?.contents || [];

                  return (
                    <div key={day} className="border rounded-lg p-4 bg-gray-50/50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Badge className={getDayColor(day)}>
                            {day}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {classes.length} class{classes.length !== 1 ? 'es' : ''}
                          </span>
                        </h4>
                      </div>

                      {classes.length > 0 ? (
                        <div className="space-y-3">
                          {classes.map((scheduleClass, index) => (
                            <div 
                              key={`${scheduleClass.course._id}-${scheduleClass.semester._id}-${scheduleClass.subject._id}-${scheduleClass.time}-${index}`}
                              className={`p-4 rounded-lg border-2 transition-all ${
                                scheduleClass.conflictType === 'teacher' 
                                  ? 'bg-red-50 border-red-200' 
                                  : 'bg-white border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                    scheduleClass.conflictType === 'teacher'
                                      ? 'bg-red-100'
                                      : 'bg-blue-100'
                                  }`}>
                                    {scheduleClass.conflictType === 'teacher' ? (
                                      <AlertTriangle className="w-6 h-6 text-red-600" />
                                    ) : (
                                      <CheckCircle className="w-6 h-6 text-blue-600" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge className={getTimeColor(scheduleClass.time)}>
                                        {formatTime(scheduleClass.time)}
                                      </Badge>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="font-medium text-gray-900">
                                        {scheduleClass.subject.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {scheduleClass.course.name} - {scheduleClass.semester.name}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {scheduleClass.conflictType && (
                                    <Alert className="border-red-200 bg-red-50 p-2">
                                      <AlertTriangle className="h-4 w-4 text-red-600" />
                                      <AlertDescription className="text-red-800 text-xs">
                                        {scheduleClass.conflictType === 'teacher' 
                                          ? 'Teacher conflict' 
                                          : 'Classroom conflict'}
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                  {onEdit && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => onEdit(schedule, scheduleClass)}
                                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                      <Edit className="w-4 h-4 mr-1" />
                                      Edit
                                    </Button>
                                  )}
                                  {onDelete && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => onDelete(
                                        schedule.teacher._id, 
                                        day, 
                                        scheduleClass.course._id,
                                        scheduleClass.semester._id,
                                        scheduleClass.subject._id
                                      )}
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      Delete
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500 bg-white rounded-lg border-2 border-dashed border-gray-200">
                          <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No classes scheduled</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}


