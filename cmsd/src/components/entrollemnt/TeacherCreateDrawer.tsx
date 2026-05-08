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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { fetchCourses } from "@/services/courseService";
import { fetchSemestersByCourse } from "@/services/semesterService";
import { fetchDepartments } from "@/services/departmentService";
import API from "@/lib/api";
import type { Teacher as ServiceTeacher } from "@/services/teacherService";
import toast from "react-hot-toast";

interface TeacherCreateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher?: ServiceTeacher | null;
}

interface FormData {
  employee_id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  role: string;
  departmentHead: boolean;
}

const initialFormData: FormData = {
  employee_id: "",
  name: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  role: "",
  departmentHead: false,
};

export function TeacherCreateDrawer({
  open,
  onOpenChange,
  teacher,
}: TeacherCreateDrawerProps) {
  const [dob, setDob] = useState<Date>();
  const [openDob, setOpenDob] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>(initialFormData);

  const [departments, setDepartments] = useState<
    { _id: string; name: string }[]
  >([]);
  const [courses, setCourses] = useState<{ _id: string; name: string }[]>([]);
  const [semesters, setSemesters] = useState<{ _id: string; name: string }[]>(
    []
  );

  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Fetch departments & courses when drawer opens
  useEffect(() => {
    if (open) {
      fetchDepartments().then(setDepartments).catch(console.error);
      fetchCourses().then(setCourses).catch(console.error);
    }
  }, [open]);

  // Fetch semesters when a course is selected
  useEffect(() => {
    if (selectedCourse) {
      fetchSemestersByCourse(selectedCourse)
        .then(setSemesters)
        .catch(console.error);
    } else {
      setSemesters([]);
      setSelectedSemester("");
    }
  }, [selectedCourse]);

  // Prefill form for editing or reset for creating
  useEffect(() => {
    if (!open) return;

    // EDIT MODE: Prefill form data if a `teacher` object is passed
    if (teacher && departments.length > 0) {
      // FIX: Find the department by NAME, as provided by the API
      const dept = departments.find((d) => d.name === teacher.department);
      setSelectedDepartment(dept?._id || "");

      const courseObj = courses.find(
        (c) => c._id === teacher.classInCharge?.course
      );
      setSelectedCourse(courseObj?._id || "");

      if (courseObj?._id) {
        fetchSemestersByCourse(courseObj._id)
          .then((sems) => {
            setSemesters(sems);
            const semObj = sems.find(
              (s) => s._id === teacher.classInCharge?.semester
            );
            setSelectedSemester(semObj?._id || "");
          })
          .catch(console.error);
      }

      setFormData({
        employee_id: teacher.employee_id,
        name: teacher.name,
        phone: teacher.phone || "",
        street: teacher.address?.street || "",
        city: teacher.address?.city || "",
        state: teacher.address?.state || "",
        pincode: teacher.address?.pincode || "",
        role: teacher.role,
        departmentHead: teacher.departmentHead || false,
      });

      setDob(teacher.dob ? new Date(teacher.dob) : undefined);
      setImageFile(null); // Reset file input on open
    }
    // CREATE MODE: Reset the form if no `teacher` is passed
    else if (!teacher) {
      setFormData(initialFormData);
      setSelectedDepartment("");
      setSelectedCourse("");
      setSelectedSemester("");
      setDob(undefined);
      setImageFile(null);
    }
  }, [open, teacher, departments, courses]);

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    try {
      const fd = new FormData();
      fd.append("employee_id", formData.employee_id);
      fd.append("name", formData.name);
      fd.append("phone", formData.phone);
      fd.append("dob", dob ? format(dob, "yyyy-MM-dd") : "");
      fd.append("role", formData.role);
      fd.append("department", selectedDepartment);
      fd.append("departmentHead", String(formData.departmentHead));

      fd.append("address[street]", formData.street);
      fd.append("address[city]", formData.city);
      fd.append("address[state]", formData.state);
      fd.append("address[pincode]", formData.pincode);

      if (selectedCourse && selectedSemester) {
        fd.append("classInCharge[course]", selectedCourse);
        fd.append("classInCharge[semester]", selectedSemester);
      }

      if (imageFile) {
        fd.append("image", imageFile);
      }

      if (teacher?._id) {
        await API.put(`/update-teacher/${teacher._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Teacher updated");
      } else {
        await API.post("/add-teacher", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Teacher created");
      }

      onOpenChange(false);
    } catch (err) {
      toast.error(`Failed ${err}`);
      console.error("Error creating/updating teacher:", err);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="h-full w-[400px] rounded-l-lg flex flex-col"
      >
        <DrawerHeader className="relative border-b px-4 py-3">
          <DrawerTitle>
            {teacher ? "Edit Teacher" : "Create Teacher"}
          </DrawerTitle>
          <DrawerDescription>Fill in the details below</DrawerDescription>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {/* --- JSX for form fields remains the same --- */}
          <InputField
            label="Employee ID"
            value={formData.employee_id}
            onChange={(val) => handleChange("employee_id", val)}
            placeholder="Enter employee ID"
          />
          <InputField
            label="Name"
            value={formData.name}
            onChange={(val) => handleChange("name", val)}
            placeholder="Enter teacher name"
          />
          <DatePicker
            label="Date of Birth"
            dob={dob}
            setDob={setDob}
            openDob={openDob}
            setOpenDob={setOpenDob}
          />
          <InputField
            label="Phone"
            value={formData.phone}
            onChange={(val) => handleChange("phone", val)}
            placeholder="Enter phone number"
          />
          <div className="space-y-2">
            <Label>Address</Label>
            <Input
              value={formData.street}
              onChange={(e) => handleChange("street", e.target.value)}
              placeholder="Street"
            />
            <Input
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="City"
            />
            <Input
              value={formData.state}
              onChange={(e) => handleChange("state", e.target.value)}
              placeholder="State"
            />
            <Input
              value={formData.pincode}
              onChange={(e) => handleChange("pincode", e.target.value)}
              placeholder="Pincode"
            />
          </div>
          <Dropdown
            label="Role"
            value={formData.role}
            onValueChange={(val) => handleChange("role", val)}
            options={["Teacher", "HOD", "Librarian"]}
          />
          <Dropdown
            label="Department"
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
            options={departments.map((d) => ({ id: d._id, name: d.name }))}
          />
          <div className="space-y-2 border rounded p-3">
            <Label className="font-semibold">Class In-Charge</Label>
            <Dropdown
              label="Course"
              value={selectedCourse}
              onValueChange={setSelectedCourse}
              options={courses.map((c) => ({ id: c._id, name: c.name }))}
            />
            <Dropdown
              label="Semester"
              value={selectedSemester}
              onValueChange={setSelectedSemester}
              options={semesters.map((s) => ({ id: s._id, name: s.name }))}
              disabled={!selectedCourse}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.departmentHead}
              onCheckedChange={(checked) =>
                handleChange("departmentHead", Boolean(checked))
              }
            />
            <Label>Department Head</Label>
          </div>
          <div className="space-y-2">
            <Label>Profile Image</Label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {imageFile ? imageFile.name : "Upload Image"}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t p-4">
          <Button className="w-full" onClick={handleSubmit}>
            {teacher ? "Update Teacher" : "Create Teacher"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// -------------------- Reusable Components --------------------

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function DatePicker({
  label,
  dob,
  setDob,
  openDob,
  setOpenDob,
}: {
  label: string;
  dob?: Date;
  setDob: (d: Date | undefined) => void;
  openDob: boolean;
  setOpenDob: (open: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {/* DOB */}
      <div className="space-y-2">
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
    </div>
  );
}

function Dropdown({
  label,
  value,
  onValueChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onValueChange: (val: string) => void;
  options: string[] | { id: string; name: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) =>
            typeof opt === "string" ? (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ) : (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.name}
              </SelectItem>
            )
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
