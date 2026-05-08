// components/common/OptionsMenu.tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Eye, Pencil, Trash } from "lucide-react";

interface OptionsMenuProps {
  onView?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  label?: string;
}

export function OptionsMenu({
  onView,
  onEdit,
  onDelete,
  label = "Actions",
}: OptionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onView}>
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={onDelete}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
