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

interface StudentControlsProps {
  onSearch?: (query: string) => void;
  onSortName?: (order: "asc" | "desc") => void;
  onSortRegister?: (order: "asc" | "desc") => void;
  onAdd?: () => void;
}

export function StudentControls({
  onSearch,
  onSortName,
  onSortRegister,
  onAdd,
}: StudentControlsProps) {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      {/* Search */}
      <Input
        placeholder="Search students..."
        className="w-1/3"
        onChange={(e) => onSearch?.(e.target.value)}
      />

      {/* Sort by Name */}
      <Select onValueChange={(val) => onSortName?.(val as "asc" | "desc")}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Sort by Name" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Name A → Z</SelectItem>
          <SelectItem value="desc">Name Z → A</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort by Register */}
      <Select onValueChange={(val) => onSortRegister?.(val as "asc" | "desc")}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Sort by Register" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Register ↑</SelectItem>
          <SelectItem value="desc">Register ↓</SelectItem>
        </SelectContent>
      </Select>

      {/* Add Student */}
      <Button className="flex items-center gap-2" onClick={onAdd}>
        <Plus size={16} />
        Add Student
      </Button>
    </div>
  );
}
