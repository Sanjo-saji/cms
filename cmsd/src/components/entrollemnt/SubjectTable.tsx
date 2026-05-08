import type { Subject, Course, Semester } from "@/types/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OptionsMenu } from "@/components/entrollemnt/options";
import { BookOpen } from "lucide-react";

interface SubjectTableProps {
  data: Subject[];
  courses: Course[];
  semesters: Semester[];
  onEdit: (s: Subject) => void;
  onDelete: (id: string) => void;
  onView?: (s: Subject) => void;
}

export function SubjectTable({ data, courses, semesters, onEdit, onDelete, onView }: SubjectTableProps) {
  // The backend already populates course and semester data, so we can use it directly
  const getCourseName = (subject: any) => {
    if (subject.course && typeof subject.course === 'object') {
      return subject.course.name || "Unknown Course";
    }
    return courses.find((c) => c._id === subject.course)?.courseName || "Unknown Course";
  };
  
  const getSemesterName = (subject: any) => {
    if (subject.semester && typeof subject.semester === 'object') {
      return subject.semester.name || "Unknown Semester";
    }
    return semesters.find((s) => s._id === subject.semester)?.name || "Unknown Semester";
  };


  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">No subjects found</div>
    );
  }

  return (
    <Table className="w-full border">
      <TableHeader>
        <TableRow className="bg-gray-100">
          <TableHead className="font-bold text-gray-700 uppercase">
            No
          </TableHead>
          <TableHead className="font-bold text-gray-700 uppercase">
            Icon
          </TableHead>
          <TableHead className="font-bold text-gray-700 uppercase">
            Subject Name
          </TableHead>
          <TableHead className="font-bold text-gray-700 uppercase">
            Course
          </TableHead>
          <TableHead className="font-bold text-gray-700 uppercase">
            Semester
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
        {data.map((subject, index) => (
          <TableRow
            key={subject._id}
            className={`${
              index % 2 === 0 ? "bg-white" : "bg-gray-50"
            } hover:bg-blue-50 transition-colors`}
          >
            <TableCell>{index + 1}</TableCell>
            <TableCell>
              {subject.image ? (
                <img
                  src={`http://localhost:3000/uploads/icons/${subject.image}`}
                  alt={subject.name}
                  className="w-10 h-10 rounded-md object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </TableCell>
            <TableCell className="font-medium text-gray-900">
              {subject.name}
            </TableCell>
            <TableCell>
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700">
                {getCourseName(subject)}
              </span>
            </TableCell>
            <TableCell>
              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700">
                {getSemesterName(subject)}
              </span>
            </TableCell>
            <TableCell className="text-sm text-gray-500">
              {subject.createdAt
                ? new Date(subject.createdAt).toLocaleDateString()
                : "-"}
            </TableCell>
            <TableCell>
              <OptionsMenu
                label="Subject"
                onView={() => onView?.(subject)}
                onEdit={() => onEdit(subject)}
                onDelete={() => onDelete(subject._id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default SubjectTable;
