import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Course = {
  _id: string;
  name: string;
  courseName: string;
  durationYears: number;
};

type Department = {
  _id: string;
  name: string;
  courses: Course[];
};

interface DepartmentListProps {
  departments: Department[];
  onEdit: (dept: Department) => void;
  onDelete: (id: string) => void;
}

export default function DepartmentList({
  departments,
  onEdit,
  onDelete,
}: DepartmentListProps) {
  if (!departments || departments.length === 0) {
    return <p className="text-gray-500">No departments found.</p>;
  }

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>Department</TableHead>
          <TableHead>Courses</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {departments.map((dept) => (
          <TableRow key={dept._id}>
            <TableCell className="font-medium">{dept.name}</TableCell>
            <TableCell>
              {dept.courses.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {dept.courses.slice(0, 3).map((course) => (
                    <span
                      key={course._id}
                      className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
                    >
                      {course.courseName} ({course.name})
                    </span>
                  ))}
                  {dept.courses.length > 3 && (
                    <span
                      className="text-gray-500 text-xs cursor-help"
                      title={dept.courses
                        .slice(3)
                        .map(
                          (c) =>
                            `${c.courseName} (${c.name}) – ${c.durationYears}y`
                        )
                        .join("\n")}
                    >
                      +{dept.courses.length - 3} more
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-gray-500 text-sm">
                  No courses assigned
                </span>
              )}
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(dept)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(dept._id)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
