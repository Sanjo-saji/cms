// src/components/schedule/ScheduleList.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, BookOpen, GraduationCap, Trash2, Edit } from "lucide-react";
import type { TeacherSchedule, ScheduleClass } from "@/types/schedule";
import { WEEK_DAYS } from "@/types/schedule";

interface ScheduleListProps {
  schedules: TeacherSchedule[];
  onEdit?: (schedule: TeacherSchedule, scheduleClass: ScheduleClass) => void;
  onDelete?: (teacherId: string, day: string, time: string) => void;
}

export default function ScheduleList({ schedules, onEdit, onDelete }: ScheduleListProps) {
  const [expandedTeacher, setExpandedTeacher] = useState<string | null>(null);
  
  console.log("📋 ScheduleList received schedules:", schedules);
  console.log("📋 ScheduleList schedules length:", schedules.length);
  
  if (schedules.length > 0) {
    console.log("📋 First schedule structure:", schedules[0]);
    console.log("📋 First schedule schedule array:", schedules[0].schedule);
    if (schedules[0].schedule && schedules[0].schedule.length > 0) {
      console.log("📋 First day structure:", schedules[0].schedule[0]);
    }
  }

  const toggleTeacherExpansion = (teacherId: string) => {
    setExpandedTeacher(expandedTeacher === teacherId ? null : teacherId);
  };

  const getDayColor = (day: string) => {
    const colors = {
      Monday: "bg-blue-100 text-blue-800",
      Tuesday: "bg-green-100 text-green-800", 
      Wednesday: "bg-yellow-100 text-yellow-800",
      Thursday: "bg-purple-100 text-purple-800",
      Friday: "bg-red-100 text-red-800"
    };
    return colors[day as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getTimeColor = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 10) return "bg-green-100 text-green-800";
    if (hour < 14) return "bg-blue-100 text-blue-800";
    return "bg-orange-100 text-orange-800";
  };

  if (schedules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            View and manage teacher schedules for the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
        <Card key={schedule._id} className="overflow-hidden">
          <CardHeader 
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleTeacherExpansion(schedule.teacher._id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {schedule.teacher.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-lg">{schedule.teacher.name}</CardTitle>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {schedule.schedule?.reduce((total, day) => total + (day.classes?.length || 0), 0) || 0} Classes
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedTeacher === schedule.teacher._id ? "Collapse" : "Expand"}
                </Button>
              </div>
            </div>
          </CardHeader>

          {expandedTeacher === schedule.teacher._id && (
            <CardContent className="pt-0">
              <div className="space-y-4">
                {WEEK_DAYS.map((day) => {
                  const daySchedule = schedule.schedule?.find(d => d.day === day);
                  const classes = daySchedule?.classes || [];

                  return (
                    <div key={day} className="border rounded-lg p-4">
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
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                  <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge className={getTimeColor(scheduleClass.time)}>
                                      {scheduleClass.time}
                                    </Badge>
                                  </div>
                                  <div className="text-sm">
                                    <p className="font-medium text-gray-900">
                                      {scheduleClass.course.name} - {scheduleClass.semester.name}
                                    </p>
                                    <p className="text-gray-600">
                                      Subject: {scheduleClass.subject.name}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
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
                                      scheduleClass.time
                                    )}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
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
