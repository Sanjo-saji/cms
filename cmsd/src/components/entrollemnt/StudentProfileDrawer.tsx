"use client";

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
import type { Student } from "@/services/studentService";
import { format } from "date-fns";

interface StudentProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student;
}

export function StudentProfileDrawer({
  open,
  onOpenChange,
  student,
}: StudentProfileDrawerProps) {
  const dobFormatted = student.dob
    ? format(new Date(student.dob), "dd/MM/yyyy")
    : "-";
  const address = student.address
    ? [
        student.address.street,
        student.address.city,
        student.address.state,
        student.address.pincode,
      ]
        .filter(Boolean)
        .join(", ")
    : "-";

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full w-[400px] rounded-l-lg flex flex-col">
        <DrawerHeader className="relative border-b px-4 py-3">
          <DrawerTitle>Student Profile</DrawerTitle>
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

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div className="flex justify-center">
            <div className="h-32 w-32 rounded-full overflow-hidden border shadow">
              {student.image ? (
                <img
                  src={student.image.replace("http://", "https://")}
                  alt={student.name}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://via.placeholder.com/150";
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                  No Image
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Detail label="Name" value={student.name} />
            <Detail label="Register Number" value={student.register} />
            <Detail label="Admission No" value={student.admission} />
            <Detail label="DOB" value={dobFormatted} />
            <Detail label="Phone" value={student.phone || "-"} />
            <Detail
              label="Course"
              value={
                typeof student.course === "object"
                  ? student.course?.name
                  : student.course || "-"
              }
            />
            <Detail
              label="Semester"
              value={
                typeof student.semester === "object"
                  ? student.semester?.name
                  : student.semester || "-"
              }
            />
            <Detail label="Address" value={address} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}
