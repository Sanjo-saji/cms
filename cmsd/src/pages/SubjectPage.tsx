import { useEffect, useState } from "react";
import { fetchSubjects, createSubject, updateSubject, deleteSubject } from "@/services/subjectService";
import { fetchCourses } from "@/services/courseService";
import { fetchSemestersByCourse } from "@/services/semesterService";
import { Button } from "@/components/ui/button";
import { SubjectTable } from "@/components/entrollemnt/SubjectTable";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { StatCard } from "@/components/entrollemnt/StatCard";
import { DeleteAlertDialog } from "@/components/entrollemnt/DeleteAlertDialog";
import { getUserRole } from "@/lib/auth";
import { BookOpen } from "lucide-react";

interface Subject {
  _id: string;
  name: string;
  course: string;
  semester: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Course {
  _id: string;
  name: string;
  courseName: string;
}

interface Semester {
  _id: string;
  name: string;
  course: string;
}

interface FormData {
  name: string;
  course: string;
  semester: string;
  image: File | null;
}

interface ServiceFormData {
  name: string;
  course: string;
  semester: string;
  image?: File;
}

const SubjectPage = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [form, setForm] = useState<FormData>({ name: "", course: "", semester: "", image: null });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [error, setError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const role = getUserRole();

  const loadData = async () => {
    try {
      console.log("Loading initial data...");
      const [subjectsData, coursesData] = await Promise.all([
        fetchSubjects(),
        fetchCourses()
      ]);
      console.log("Loaded subjects:", subjectsData);
      console.log("Loaded courses:", coursesData);
      setSubjects(subjectsData);
      setCourses(coursesData);
    } catch (error) {
      console.error("Error loading initial data:", error);
      setError("Failed to load data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (form.course) {
      fetchSemestersByCourse(form.course)
        .then(setSemesters)
        .catch(error => {
          console.error("Error fetching semesters:", error);
          setSemesters([]);
        });
    } else {
      setSemesters([]);
    }
  }, [form.course]);

  const resetForm = () => {
    setForm({ name: "", course: "", semester: "", image: null });
    setEditingSubject(null);
    setEditDialogOpen(false);
  };

  const handleAddOrEditSubject = async () => {
    setError("");
    if (!form.name || !form.course || !form.semester) {
      setError("Please fill in all required fields");
      return;
    }

    // Convert form data to match service interface
    const serviceFormData: ServiceFormData = {
      name: form.name,
      course: form.course,
      semester: form.semester,
      ...(form.image ? { image: form.image } : {})
    };

    console.log("Sending form data:", serviceFormData);

    try {
      if (editingSubject) {
        const res = await updateSubject(editingSubject._id, serviceFormData);
        if (res.success) {
          setSubjects(subjects.map((s) => (s._id === editingSubject._id ? res.subject : s)));
          resetForm();
        } else {
          setError(res.message);
        }
      } else {
        const res = await createSubject(serviceFormData);
        if (res.success) {
          setSubjects([...subjects, res.subject]);
          resetForm();
        } else {
          setError(res.message);
        }
      }
    } catch (e) {
      setError("Failed to save subject");
      console.error(e);
    }
  };

  const handleDeleteSubject = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteSubject(deleteTarget);
      if (res.success) {
        setSubjects(subjects.filter((s) => s._id !== deleteTarget));
        setDeleteOpen(false);
        setDeleteTarget(null);
      } else {
        setError(res.message);
      }
    } catch (e) {
      setError("Failed to delete subject");
    }
  };

  const startEdit = (subject: Subject) => {
    setForm({
      name: subject.name,
      course: subject.course,
      semester: subject.semester,
      image: null
    });
    setEditingSubject(subject);
    setEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
  <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="border-b border-gray-200 pb-5">
          <h1 className="text-2xl font-semibold text-gray-900">Subject Management</h1>
          <p className="mt-2 text-sm text-gray-700">Manage your courses' subjects and their details</p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Subjects"
            value={subjects.length}
            icon={BookOpen}
            color="blue"
            description={subjects.length > 0 ? `+${subjects.length} subjects` : "No subjects"}
            footer="Last updated just now"
          />
        </div>

        {/* Main Content Section */}
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
              <div className="ml-4">
                {role === "Principal" && (
                  <Button className="w-fit mb-4" onClick={() => setEditDialogOpen(true)}>
                    Add Subject
                  </Button>
                )}
              </div>
          </div>

          {/* Table Section */}
          <div className="bg-white shadow-sm ring-1 ring-gray-300 sm:rounded-lg overflow-hidden">
            <SubjectTable
              data={subjects}
              courses={courses}
              semesters={semesters}
              onEdit={startEdit}
              onDelete={(id) => {
                setDeleteTarget(id);
                setDeleteOpen(true);
              }}
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <AlertDialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold">
              {editingSubject ? "Edit Subject" : "Add New Subject"}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter subject name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                    Course *
                  </label>
                  <select
                    id="course"
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value, semester: "" })}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>{course.courseName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                    Semester *
                  </label>
                  <select
                    id="semester"
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    disabled={!form.course}
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((semester) => (
                      <option key={semester._id} value={semester._id}>{semester.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Icon
                  </label>
                  <div className="mt-1 flex items-center gap-x-3">
                    {form.image ? (
                      <img
                        src={URL.createObjectURL(form.image)}
                        alt="Preview"
                        className="h-32 w-32 rounded-lg object-cover"
                      />
                    ) : editingSubject?.image ? (
                      <img
                        src={`http://localhost:3000/uploads/icons/${editingSubject.image}`}
                        alt={editingSubject.name}
                        className="h-32 w-32 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-lg bg-gray-50 flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                    <div className="flex flex-col items-start">
                      <label
                        htmlFor="image"
                        className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 cursor-pointer"
                      >
                        Change Icon
                        <input
                          type="file"
                          id="image"
                          accept="image/*"
                          onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                          className="sr-only"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: null })}
                        className="mt-2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Recommended: Square image (1:1 ratio), maximum 2MB
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter className="bg-gray-50 px-6 py-4">
            <div className="flex flex-row-reverse gap-x-2">
              <Button 
                onClick={handleAddOrEditSubject}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2"
              >
                {editingSubject ? "Update Subject" : "Add Subject"}
              </Button>
              <AlertDialogCancel asChild>
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
              </AlertDialogCancel>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Alert Dialog (shared) */}
      <DeleteAlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteSubject}
        entityName="Subject"
      />
    </div>
  );
};

export default SubjectPage;