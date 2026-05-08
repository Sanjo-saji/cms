import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// FIX 1: Correct the interface to match the actual data structure
interface Teacher {
  _id: string;
  name: string;
  employee_id: string;
  role: string;
  department?: string;
  phone?: string;
  dob?: string;
  image?: string;
  classInCharge?: { course: string; semester: string } | null; // Corrected type
  departmentHead?: boolean;
}

interface TeacherProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher;
}

export function TeacherProfileDrawer({
  open,
  onOpenChange,
  teacher,
}: TeacherProfileDrawerProps) {
  // FIX 2: Create a helper function to format the object into a string
  const formatClassInCharge = (
    cic: { course: string; semester: string } | null | undefined
  ): string => {
    if (!cic) {
      return "None";
    }
    // In a real app, you might fetch the course/semester names from these IDs.
    // For now, we display the IDs in a readable format.
    return `Course ID: ${cic.course}, Semester ID: ${cic.semester}`;
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full w-[400px] rounded-l-lg flex flex-col">
        {/* Header */}
        <DrawerHeader className="relative border-b px-4 py-3">
          <DrawerTitle>Teacher Profile</DrawerTitle>
          <DrawerDescription>Details overview</DrawerDescription>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3"
            >
              <X className="h-5 w-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {/* Profile Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Profile Image */}
          <div className="flex justify-center">
            <div className="h-32 w-32 rounded-full overflow-hidden border shadow">
              {teacher.image ? (
                <img
                  src={teacher.image}
                  alt={teacher.name}
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <Detail label="Name" value={teacher.name} />
            <Detail label="Employee ID" value={teacher.employee_id} />
            <Detail label="Role" value={teacher.role} />
            <Detail label="Department" value={teacher.department || "-"} />
            <Detail
              label="DOB"
              value={
                teacher.dob
                  ? new Date(teacher.dob).toLocaleDateString("en-IN")
                  : "-"
              }
            />
            <Detail label="Phone" value={teacher.phone || "-"} />
            <Detail
              label="Class In-Charge"
              // FIX 3: Use the formatted string instead of the object
              value={formatClassInCharge(teacher.classInCharge)}
            />
            <Detail
              label="Head of Department"
              value={teacher.departmentHead ? "Yes" : "No"}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}
