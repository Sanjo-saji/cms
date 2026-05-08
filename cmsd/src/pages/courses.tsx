import { useEffect, useState } from "react";
import { fetchCourses, createCourse, deleteCourse, updateCourse } from "@/services/courseService";
import { getUserRole } from "@/lib/auth";
import type { Course } from "@/types/department";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/entrollemnt/StatCard";
import { DeleteAlertDialog } from "@/components/entrollemnt/DeleteAlertDialog";
import { GraduationCap } from "lucide-react";
import { CourseTable } from "@/components/entrollemnt/CourseTable";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

const Courses = () => {

  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({ name: "", courseName: "", durationYears: 1 });
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const role = getUserRole();

  useEffect(() => {
    fetchCourses()
      .then(setCourses)
      .catch(() => setError("Failed to fetch courses"));
  }, []);

  const startEdit = (course: Course) => {
    setForm({
      name: course.name,
      courseName: course.courseName,
      durationYears: course.durationYears,
    });
    setEditingCourseId(course._id);
    setEditDialogOpen(true);
  };

  const handleAddOrEditCourse = async () => {
    setError("");
    try {
      if (editingCourseId) {
        const res = await updateCourse(editingCourseId, form);
        if (res.success) {
          setCourses(courses.map((c) => (c._id === editingCourseId ? res.course : c)));
          setEditingCourseId(null);
          setForm({ name: "", courseName: "", durationYears: 1 });
          setEditDialogOpen(false);
        } else {
          setError(res.message || "Failed to update course");
        }
        return;
      }
      // Otherwise, create new
      const res = await createCourse(form);
      if (res.success) {
        setCourses([...courses, res.course]);
        setForm({ name: "", courseName: "", durationYears: 1 });
        setEditDialogOpen(false);
      } else {
        setError(res.message || "Failed to add course");
      }
    } catch (e) {
      setError("Failed to add/update course");
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteCourse(deleteTarget);
      if (res.success) {
        setCourses(courses.filter((c) => c._id !== deleteTarget));
        setDeleteOpen(false);
        setDeleteTarget(null);
      } else {
        setError(res.message || "Delete failed");
      }
    } catch {
      setError("Delete failed");
    }
  };

  return (
    <div className="p-4 px-20 flex flex-col gap-4 w-full">
      {/* Stat Card */}
      <div className="flex gap-4">
        <StatCard
          title="Courses"
          value={courses.length}
          icon={GraduationCap}
          color="blue"
          description={courses.length > 0 ? `+${courses.length} total` : "No courses"}
          footer="Last updated just now"
        />
      </div>

      {/* Add Course Button (Principal only) */}
      {role === "Principal" && (
        <Button className="w-fit mb-4" onClick={() => setEditDialogOpen(true)}>
          Add Course
        </Button>
      )}

      {/* Error Message */}
      {error && <div className="text-red-500 mb-2">{error}</div>}

      {/* Courses Table - use CourseTable for consistent UI */}
      <CourseTable
        data={courses}
        onDelete={(id) => {
          setDeleteTarget(id);
          setDeleteOpen(true);
        }}
        onEdit={startEdit}
      />

      {/* Edit/Add Dialog */}
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{editingCourseId ? "Edit Course" : "Add Course"}</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="p-4">
            <input
              type="text"
              placeholder="Short Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="border px-2 py-1 rounded w-full mb-2"
            />
            <input
              type="text"
              placeholder="Full Course Name"
              value={form.courseName}
              onChange={(e) => setForm({ ...form, courseName: e.target.value })}
              className="border px-2 py-1 rounded w-full mb-2"
            />
            <input
              type="number"
              min={1}
              max={10}
              placeholder="Duration (years)"
              value={form.durationYears}
              onChange={(e) => setForm({ ...form, durationYears: Number(e.target.value) })}
              className="border px-2 py-1 rounded w-full mb-2"
            />
          </div>
          <AlertDialogFooter>
            <Button onClick={handleAddOrEditCourse}>{editingCourseId ? "Update" : "Add"}</Button>
            <AlertDialogCancel asChild>
              <Button variant="outline" onClick={() => {
                setEditingCourseId(null);
                setForm({ name: "", courseName: "", durationYears: 1 });
              }}>Cancel</Button>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Alert Dialog */}
      <DeleteAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteCourse}
        entityName="Course"
      />
    </div>
  );
};

export default Courses;
