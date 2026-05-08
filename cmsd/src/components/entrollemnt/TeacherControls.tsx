import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface TeacherControlsProps {
  onSearch?: (query: string) => void;
  onSortName?: (order: "asc" | "desc") => void;
  onSortDepartment?: (order: "asc" | "desc") => void;
  onFilterRole?: (role: string) => void;
  onAdd?: () => void;
}

export function TeacherControls({
  onSearch,
  onSortName,
  onSortDepartment,
  onFilterRole,
  onAdd,
}: TeacherControlsProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {/* Search by name */}
      <Input
        placeholder="Search teachers..."
        className="w-1/3"
        onChange={(e) => onSearch?.(e.target.value)}
      />

      {/* Sort by name */}
      <Select onValueChange={(val) => onSortName?.(val as "asc" | "desc")}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Sort by Name" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">A → Z</SelectItem>
          <SelectItem value="desc">Z → A</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort by department */}
      <Select
        onValueChange={(val) => onSortDepartment?.(val as "asc" | "desc")}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Sort by Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">A → Z</SelectItem>
          <SelectItem value="desc">Z → A</SelectItem>
        </SelectContent>
      </Select>

      {/* Filter by role */}
      <Select
        onValueChange={(val) =>
          onFilterRole?.(val === "all" ? "" : (val as string))
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Filter by Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="Teacher">Teacher</SelectItem>
          <SelectItem value="HOD">HOD</SelectItem>
          <SelectItem value="Principal">Principal</SelectItem>
        </SelectContent>
      </Select>

      {/* Add Teacher */}
      <Button className="flex items-center gap-2" onClick={onAdd}>
        <Plus size={16} />
        Add Teacher
      </Button>
    </div>
  );
}
