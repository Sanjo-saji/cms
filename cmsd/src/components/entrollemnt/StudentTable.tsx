"use client";

import type { Student } from "@/services/studentService";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OptionsMenu } from "./options";
import { StudentProfileDrawer } from "./StudentProfileDrawer";

interface StudentTableProps {
  data: Student[];
  onDelete: (id: string) => void;
  onEdit: (student: Student) => void;
}

export function StudentTable({ data, onDelete, onEdit }: StudentTableProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setDrawerOpen(true);
  };

  return (
    <>
      <Table className="w-full border">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead>No</TableHead>
            <TableHead>Register</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Admission</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>DOB</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((student, index) => (
            <TableRow
              key={student._id}
              className={`${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-blue-50`}
            >
              <TableCell>{index + 1}</TableCell>
              <TableCell>{student.register}</TableCell>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.admission}</TableCell>
              <TableCell>{student.phone}</TableCell>
              <TableCell>{student.dob}</TableCell>
              <TableCell>
                {typeof student.course === "string"
                  ? student.course
                  : student.course?.name}
              </TableCell>
              <TableCell>
                {typeof student.semester === "string"
                  ? student.semester
                  : student.semester?.name}
              </TableCell>
              <TableCell>
                <OptionsMenu
                  label="Student"
                  onView={() => handleView(student)}
                  onDelete={() => onDelete(student._id)}
                  onEdit={() => onEdit(student)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedStudent && (
        <StudentProfileDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          student={selectedStudent}
        />
      )}
    </>
  );
}
