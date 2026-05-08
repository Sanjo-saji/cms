"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { X, Upload, CalendarIcon } from "lucide-react";
import { fetchCourses } from "@/services/courseService";
import { fetchSemestersByCourse } from "@/services/semesterService";
import API from "@/lib/api";
import type { Student } from "@/services/studentService";
import toast from "react-hot-toast";

interface StudentCreateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  onSuccess?: () => void;
}

export function StudentCreateDrawer({
  open,
  onOpenChange,
  student,
  onSuccess,
}: StudentCreateDrawerProps) {
  const [dob, setDob] = useState<Date>();
  const [openDob, setOpenDob] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [courses, setCourses] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);

  const [form, setForm] = useState({
    register: "",
    name: "",
    phone: "",
    address: { street: "", city: "", state: "", pincode: "" },
    course: "",
    semester: "",
    admission: "",
    image: null as File | null,
  });

  // Fetch courses when drawer opens
  useEffect(() => {
    if (!open) return;
    fetchCourses()
      .then((data) => {
        if (Array.isArray(data)) setCourses(data);
        else if (Array.isArray(data.courses)) setCourses(data.courses);
        else setCourses([]);
      })
      .catch((err) => {
        console.error("Error fetching courses:", err);
        setCourses([]);
      });
  }, [open]);

  // Prefill form and load semesters if editing
  useEffect(() => {
    if (student) {
      setForm({
        register: student.register || "",
        name: student.name || "",
        phone: student.phone || "",
        address: {
          street: student.address?.street || "",
          city: student.address?.city || "",
          state: student.address?.state || "",
          pincode: student.address?.pincode || "",
        },
        course:
          typeof student.course === "string"
            ? student.course
            : student.course?._id || "",
        semester:
          typeof student.semester === "string"
            ? student.semester
            : student.semester?._id || "",
        admission: student.admission || "",
        image: null,
      });

      setDob(student.dob ? new Date(student.dob) : undefined);

      // Load semesters for the student's course if course is object
      if (student.course && typeof student.course !== "string") {
        const courseId = student.course._id;
        const semesterId =
          student.semester && typeof student.semester !== "string"
            ? student.semester._id
            : "";
        handleCourseChange(courseId, semesterId);
      }
    } else {
      setForm({
        register: "",
        name: "",
        phone: "",
        address: { street: "", city: "", state: "", pincode: "" },
        course: "",
        semester: "",
        admission: "",
        image: null,
      });
      setDob(undefined);
      setSemesters([]);
    }
  }, [student, open]);

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddressChange = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      address: { ...prev.address, [key]: value },
    }));
  };

  // Course change with optional pre-selected semester
  const handleCourseChange = async (
    courseId: string,
    selectedSemesterId = ""
  ) => {
    setForm((prev) => ({
      ...prev,
      course: courseId,
      semester: selectedSemesterId,
    }));
    try {
      const data = await fetchSemestersByCourse(courseId);
      const sems = Array.isArray(data) ? data : [];
      setSemesters(sems);
      // If editing and pre-selected semester exists, ensure it's valid
      if (
        selectedSemesterId &&
        !sems.find((s) => s._id === selectedSemesterId)
      ) {
        setForm((prev) => ({ ...prev, semester: "" }));
      }
    } catch (err) {
      console.error("Error fetching semesters:", err);
      setSemesters([]);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("register", form.register);
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("course", form.course);
      formData.append("semester", form.semester);
      formData.append("admission", form.admission);

      formData.append("dob", dob ? format(dob, "yyyy-MM-dd") : "");

      formData.append("address[street]", form.address.street);
      formData.append("address[city]", form.address.city);
      formData.append("address[state]", form.address.state);
      formData.append("address[pincode]", form.address.pincode);

      if (form.image) formData.append("image", form.image);

      if (student?._id) {
        await API.put(`/update-student/${student._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Student updated");
      } else {
        await API.post("/add-student", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Student Created");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(`Failed ${error}`);
      console.error("Error saving student:", error);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="h-full w-[400px] rounded-l-lg flex flex-col"
      >
        {/* Header */}
        <DrawerHeader className="relative border-b px-4 py-3">
          <div>
            <DrawerTitle>
              {student ? "Edit Student" : "Create Student"}
            </DrawerTitle>
            <DrawerDescription>
              {student ? "Update student details" : "Fill in the details below"}
            </DrawerDescription>
          </div>
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

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {/* Register */}
          <div className="space-y-2">
            <Label htmlFor="register">Register Number</Label>
            <Input
              id="register"
              placeholder="Enter register no"
              value={form.register}
              onChange={(e) => handleChange("register", e.target.value)}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* DOB */}
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Popover open={openDob} onOpenChange={setOpenDob}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !dob && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dob ? format(dob, "yyyy-MM-dd") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dob}
                  onSelect={(date) => {
                    if (date) setDob(date);
                    setOpenDob(false);
                  }}
                  startMonth={new Date(1950, 0, 1)}
                  endMonth={new Date()}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              placeholder="Street"
              value={form.address.street}
              onChange={(e) => handleAddressChange("street", e.target.value)}
            />
            <Input
              placeholder="City"
              value={form.address.city}
              onChange={(e) => handleAddressChange("city", e.target.value)}
            />
            <Input
              placeholder="State"
              value={form.address.state}
              onChange={(e) => handleAddressChange("state", e.target.value)}
            />
            <Input
              placeholder="Pincode"
              value={form.address.pincode}
              onChange={(e) => handleAddressChange("pincode", e.target.value)}
            />
          </div>

          {/* Course */}
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select
              value={form.course || ""}
              onValueChange={(value) => handleCourseChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-50">
                {courses.length > 0 ? (
                  courses.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name} - {c.courseName}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">
                    No courses available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Semester */}
          <div className="space-y-2">
            <Label htmlFor="semester">Semester</Label>
            <Select
              value={form.semester || ""}
              onValueChange={(value) => handleChange("semester", value)}
              disabled={semesters.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    semesters.length ? "Select semester" : "Select course first"
                  }
                />
              </SelectTrigger>
              <SelectContent position="popper" className="z-50">
                {semesters.length > 0 ? (
                  semesters.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">
                    No semesters available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Admission */}
          <div className="space-y-2">
            <Label htmlFor="admission">Admission No</Label>
            <Input
              placeholder="Enter admission number"
              value={form.admission}
              onChange={(e) => handleChange("admission", e.target.value)}
            />
          </div>

          {/* Profile Image */}
          <div className="space-y-2">
            <Label htmlFor="image">Profile Image</Label>
            <div className="flex items-center gap-2">
              <input
                id="image"
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) =>
                  handleChange("image", e.target.files?.[0] || null)
                }
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="border-t p-4">
          <Button className="w-full" onClick={handleSubmit}>
            {student ? "Update Student" : "Create Student"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
