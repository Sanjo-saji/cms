import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OptionsMenu } from "@/components/entrollemnt/options";

import type { Course } from "@/types/department";

interface CourseTableProps {
  data: Course[];
  onDelete: (id: string) => void;
  onEdit?: (course: Course) => void;
}

export function CourseTable({ data, onDelete, onEdit }: CourseTableProps) {
  return (
    <>
      <Table className="w-full border">
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="font-bold text-gray-700 uppercase">
              Name
            </TableHead>
            <TableHead className="font-bold text-gray-700 uppercase">
              Full Name
            </TableHead>
            <TableHead className="font-bold text-gray-700 uppercase">
              Duration
            </TableHead>
            <TableHead className="font-bold text-gray-700 uppercase">
              Created
            </TableHead>
            <TableHead className="font-bold text-gray-700 uppercase">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((course, index) => (
            <TableRow
              key={course._id}
              className={`${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-blue-50 transition-colors`}
            >
              <TableCell>{course.name}</TableCell>
              <TableCell>{course.courseName}</TableCell>
              <TableCell>{course.durationYears}</TableCell>
              <TableCell>
                {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell>
                <OptionsMenu
                  onEdit={() => onEdit?.(course)}
                  onDelete={() => onDelete(course._id)}
                  label="Course"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
