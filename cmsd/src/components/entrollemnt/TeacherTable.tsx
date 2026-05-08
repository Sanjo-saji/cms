import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OptionsMenu } from "@/components/entrollemnt/options";
import { TeacherProfileDrawer } from "./teacher-profile-drawer";

export interface Teacher {
  _id: string;
  name: string;
  employee_id: string;
  role: string;
  department?: string;
  phone?: string;
  dob?: string;
  image?: string;
  classInCharge?: { course: string; semester: string } | null;
  departmentHead: boolean;
}

interface TeacherTableProps {
  data: Teacher[];
  onDelete: (id: string) => void;
  onEdit: (teacher: Teacher) => void;
}

export function TeacherTable({ data, onDelete, onEdit }: TeacherTableProps) {
  const [open, setOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  return (
    <>
      <Table className="w-full border">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="font-bold text-gray-700 uppercase">
              ID
            </TableHead>
            <TableHead className="font-bold text-gray-700 uppercase">
              Name
            </TableHead>
            <TableHead className="font-bold text-gray-700 uppercase">
              Role
            </TableHead>
            <TableHead className="font-bold text-gray-700 uppercase">
              Department
            </TableHead>
            <TableHead className="font-bold text-gray-700 uppercase">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((teacher, index) => (
            <TableRow
              key={teacher._id}
              className={`${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-blue-50 transition-colors`}
            >
              <TableCell>{teacher.employee_id}</TableCell>
              <TableCell>{teacher.name}</TableCell>
              <TableCell>{teacher.role}</TableCell>
              <TableCell>{teacher.department || "-"}</TableCell>
              <TableCell>
                <OptionsMenu
                  onView={() => {
                    setSelectedTeacher(teacher);
                    setOpen(true);
                  }}
                  onEdit={() => onEdit(teacher)}
                  onDelete={() => onDelete(teacher._id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ------------------ Teacher Profile Drawer ------------------ */}
      {selectedTeacher && (
        <TeacherProfileDrawer
          open={open}
          onOpenChange={setOpen}
          teacher={selectedTeacher}
        />
      )}
    </>
  );
}
