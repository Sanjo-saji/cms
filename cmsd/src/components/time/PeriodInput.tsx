"use client";

interface PeriodInputProps {
  period: any;
  subjects: any[];
  onChange: (field: "subject" | "start" | "end", value: string) => void;
  onRemove: () => void;
}

const TIMES = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

export default function PeriodInput({
  period,
  subjects,
  onChange,
  onRemove,
}: PeriodInputProps) {
  return (
    <div className="flex gap-2 mb-2 items-center">
      <select
        className="border p-1 rounded flex-1"
        value={period.subject}
        onChange={(e) => onChange("subject", e.target.value)}
      >
        <option value="">-- Select Subject --</option>
        {subjects.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        className="border p-1 rounded"
        value={period.start}
        onChange={(e) => onChange("start", e.target.value)}
      >
        <option value="">Start</option>
        {TIMES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        className="border p-1 rounded"
        value={period.end}
        onChange={(e) => onChange("end", e.target.value)}
      >
        <option value="">End</option>
        {TIMES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <button
        className="bg-red-500 text-white px-2 py-1 rounded"
        onClick={onRemove}
      >
        X
      </button>
    </div>
  );
}
