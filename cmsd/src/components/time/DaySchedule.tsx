"use client";

import PeriodInput from "./PeriodInput";

interface DayScheduleProps {
  day: string;
  periods: any[];
  subjects: any[];
  onChange: (
    periodIndex: number,
    field: "subject" | "start" | "end",
    value: string
  ) => void;
  onAdd: () => void;
  onRemove: (periodIndex: number) => void;
}

export default function DaySchedule({
  day,
  periods,
  subjects,
  onChange,
  onAdd,
  onRemove,
}: DayScheduleProps) {
  return (
    <div className="border p-4 rounded">
      <h4 className="font-bold mb-2">{day}</h4>
      {periods.map((p, idx) => (
        <PeriodInput
          key={idx}
          period={p}
          subjects={subjects}
          onChange={(field, value) => onChange(idx, field, value)}
          onRemove={() => onRemove(idx)}
        />
      ))}
      <button
        className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
        onClick={onAdd}
      >
        Add Period
      </button>
    </div>
  );
}
