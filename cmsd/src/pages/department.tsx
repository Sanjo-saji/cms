"use client";

import { useEffect, useState } from "react";
import API from "@/lib/api";
import { Button } from "@/components/ui/button";
import DepartmentForm from "../components/department/DepartmentForm";
import DepartmentList from "../components/department/DepartmentList";
import type { Department, Course } from "@/types/department";
import { DeleteDepartmentAlert } from "../components/department/DeleteDepartmentAlert";

export default function Department() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);

  // For Delete Dialog
  const [deleteDeptId, setDeleteDeptId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchCourses();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await API.get("/get-departments");
      if (res.data.success) {
        setDepartments(res.data.departments as Department[]);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await API.get("/class/courses");
      if (res.data.success) {
        setCourses(res.data.courses as Course[]);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const handleSave = async (data: { name: string; courses: string[] }) => {
    try {
      if (editDept) {
        await API.put(`/update-department/${editDept._id}`, data);
      } else {
        await API.post("/add-department", data);
      }
      fetchDepartments();
      setOpen(false);
      setEditDept(null);
    } catch (error) {
      console.error("Failed to save department:", error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteDeptId(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDeptId) return;
    try {
      await API.delete(`/delete-department/${deleteDeptId}`);
      fetchDepartments();
      setDeleteOpen(false);
      setDeleteDeptId(null);
    } catch (error) {
      console.error("Failed to delete department:", error);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center gap-8 w-full min-h-screen bg-gray-50">
      {/* Container */}
      <div className="w-[75%] bg-white rounded-lg shadow-md p-6 flex flex-col gap-6">
        {/* Header + Add Button */}
        <div className="flex justify-between items-center border-b pb-2">
          <h1 className="text-2xl font-semibold text-gray-800">Departments</h1>
          <Button onClick={() => setOpen(true)}>+ Add Department</Button>
        </div>

        {/* Table list */}
        <div className="mt-4">
          <DepartmentList
            departments={departments}
            onEdit={(dept) => {
              setEditDept(dept);
              setOpen(true);
            }}
            onDelete={handleDeleteClick}
          />
        </div>
      </div>

      {/* Form Dialog */}
      <DepartmentForm
        open={open}
        onOpenChange={setOpen}
        courses={courses}
        onSave={handleSave}
        initialData={editDept}
      />

      {/* Delete Department Alert Dialog */}
      <DeleteDepartmentAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
