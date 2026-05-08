"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Department, Course } from "@/types/department";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
  onSave: (data: { name: string; courses: string[] }) => void;
  initialData: Department | null;
}

export default function DepartmentForm({
  open,
  onOpenChange,
  courses,
  onSave,
  initialData,
}: Props) {
  const [name, setName] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSelectedCourses(initialData.courses.map((c) => c._id));
    } else {
      setName("");
      setSelectedCourses([]);
    }
  }, [initialData, open]);

  const toggleCourse = (id: string) => {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Department" : "Add Department"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Department name */}
          <div>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Department name"
              className="mt-1"
            />
          </div>

          {/* Courses table */}
          <div>
            <Label>Assign Courses</Label>
            <div className="mt-2 border rounded-md overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">Select</th>
                    <th className="p-2 text-left">Course Name</th>
                    <th className="p-2 text-left">Code</th>
                    <th className="p-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr
                      key={c._id}
                      className="border-t hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-2">
                        <Checkbox
                          checked={selectedCourses.includes(c._id)}
                          onCheckedChange={() => toggleCourse(c._id)}
                        />
                      </td>
                      <td className="p-2">{c.courseName}</td>
                      <td className="p-2">{c.name}</td>
                      <td className="p-2">{c.durationYears} years</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save button */}
          <Button
            onClick={() => onSave({ name, courses: selectedCourses })}
            className="w-full"
          >
            {initialData ? "Update" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
