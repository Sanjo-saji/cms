// src/components/assignment/MobileAssignmentList.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trash2, Edit, User, Building2, BookOpen, GraduationCap } from "lucide-react";
import type { Assignment } from "@/types/assignment";

interface MobileAssignmentListProps {
  assignments: Assignment[];
  onEdit?: (assignment: Assignment, assignmentItem: any) => void;
  onDelete: (teacherId: string, courseId: string, semesterId: string) => void;
}

export default function MobileAssignmentList({
  assignments,
  onEdit,
  onDelete,
}: MobileAssignmentListProps) {
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const handleDelete = async (teacherId: string, courseId: string, semesterId: string) => {
    setDeleteLoading(`${teacherId}-${courseId}-${semesterId}`);
    try {
      onDelete(teacherId, courseId, semesterId);
    } finally {
      setDeleteLoading(null);
    }
  };

  if (assignments.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <Card key={assignment._id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {assignment.teacher.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">
                    {assignment.teacher.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {assignment.teacher.employee_id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Remove the teacher-level delete button since we now have individual assignment item delete buttons */}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {assignment.department}
                </span>
              </div>

              {assignment.assignments.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {item.course.courseName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(assignment, item)}
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(assignment.teacher._id, item.course._id, item.semester._id)}
                        disabled={deleteLoading === `${assignment.teacher._id}-${item.course._id}-${item.semester._id}`}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {item.semester.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {item.subject.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
