"use client";

import { useEffect, useState } from "react";
import { fetchCourses } from "@/services/courseService";
import { fetchSemestersByCourse } from "@/services/semesterService";
import {
  getTeachersByCourseAndSemester,
  getSubjectsByCourseAndSemester,
  addOrUpdateTimeTable,
} from "@/services/timetableService";
import DaySchedule from "./DaySchedule";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

interface Period {
  subject: string;
  start: string;
  end: string;
}

interface Day {
  day: string;
  time: Period[];
}

export default function TimetableManager() {
  const [courses, setCourses] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const [days, setDays] = useState<Day[]>(
    DAYS.map((d) => ({ day: d, time: [] }))
  );

  // Load courses
  useEffect(() => {
    fetchCourses().then(setCourses);
  }, []);

  // Load semesters
  useEffect(() => {
    if (!selectedCourse) return setSemesters([]);
    fetchSemestersByCourse(selectedCourse).then(setSemesters);
    setSelectedSemester("");
    setTeachers([]);
    setSelectedTeacher("");
    setSubjects([]);
    setDays(DAYS.map((d) => ({ day: d, time: [] })));
  }, [selectedCourse]);

  // Load teachers
  useEffect(() => {
    if (!selectedCourse || !selectedSemester) return setTeachers([]);
    getTeachersByCourseAndSemester(selectedCourse, selectedSemester).then(
      (res) => setTeachers(res.teachers || [])
    );
  }, [selectedCourse, selectedSemester]);

  // Load subjects
  useEffect(() => {
    if (!selectedCourse || !selectedSemester) return setSubjects([]);
    getSubjectsByCourseAndSemester(selectedCourse, selectedSemester).then(
      (res) => setSubjects(res.subjects || [])
    );
  }, [selectedCourse, selectedSemester]);

  const updatePeriod = (
    dayIndex: number,
    periodIndex: number,
    field: keyof Period,
    value: string
  ) => {
    setDays((prev) => {
      const copy = [...prev];
      copy[dayIndex].time[periodIndex][field] = value;
      return copy;
    });
  };

  const addPeriod = (dayIndex: number) => {
    setDays((prev) => {
      const copy = [...prev];
      copy[dayIndex].time.push({ subject: "", start: "", end: "" });
      return copy;
    });
  };

  const removePeriod = (dayIndex: number, periodIndex: number) => {
    setDays((prev) => {
      const copy = [...prev];
      copy[dayIndex].time.splice(periodIndex, 1);
      return copy;
    });
  };

  const handleSubmit = async () => {
    const payload = {
      course: selectedCourse,
      semster: selectedSemester, // match your backend key exactly
      days: days
        .map((d) => ({
          day: d.day,
          time: d.time.filter((p) => p.subject && p.start && p.end),
        }))
        .filter((d) => d.time.length > 0),
    };

    try {
      const response = await addOrUpdateTimeTable(payload);
      alert(response?.message || "Timetable saved!");
    } catch (err: any) {
      // Display backend message if available
      const msg = err?.response?.data?.message;
      if (msg) {
        alert(msg);
      } else {
        alert("Failed to save timetable");
      }
    }
  };
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Course & Semester */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label>Course</label>
          <select
            className="w-full border p-2 rounded"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- Select Course --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label>Semester</label>
          <select
            className="w-full border p-2 rounded"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="">-- Select Semester --</option>
            {semesters.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Teacher */}
      {teachers.length > 0 && (
        <div>
          <label>Teacher</label>
          <select
            className="w-full border p-2 rounded"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            <option value="">-- Select Teacher --</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Days & Periods */}
      {selectedSemester &&
        subjects.length > 0 &&
        days.map((d, idx) => (
          <DaySchedule
            key={d.day}
            day={d.day}
            periods={d.time}
            subjects={subjects}
            onChange={(pIdx, field, value) =>
              updatePeriod(idx, pIdx, field, value)
            }
            onAdd={() => addPeriod(idx)}
            onRemove={(pIdx) => removePeriod(idx, pIdx)}
          />
        ))}

      {/* Submit */}
      <button
        className="bg-green-500 text-white px-4 py-2 rounded mt-4"
        onClick={handleSubmit}
      >
        Save Timetable
      </button>
    </div>
  );
}
