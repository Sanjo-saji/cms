// pages/admin/timetable/page.tsx or wherever your main page is
"use client";

import TimetableForm from "@/components/time/TimetableForm";

export default function TimetablePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Timetable</h1>
      <TimetableForm />
    </div>
  );
}
