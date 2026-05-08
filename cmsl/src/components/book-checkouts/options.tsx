import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";
import API from "@/Api/api";
import { toast } from "react-hot-toast";

interface OptionsProps {
  checkoutId: string;
  onStatusUpdated?: () => void;
  onDeleteSuccess?: (checkoutId: string, bookId?: string) => void; // ✅ new prop
  bookId?: string;
  status?: string;
  onView?: () => void;
}

const Options = ({
  checkoutId,
  onStatusUpdated,
  onDeleteSuccess,
  bookId,
  status,
  onView,
}: OptionsProps) => {
  const handleToggleStatus = async () => {
    try {
      const newStatus = status === "approved" ? "pending" : "approved";

      const res = await API.put(
        `/data/update-checkout-status/${checkoutId}/${bookId}`,
        { status: newStatus }
      );

      if (res.data.success) {
        toast.success(`Checkout marked as ${newStatus}`);
        onStatusUpdated?.();
      } else {
        toast.error(res.data.message || "Failed to update");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await API.delete(
        `/data/delete-checkout/${checkoutId}/${bookId}`
      );

      if (res.data.success) {
        toast.success("Checkout deleted successfully");
        // ✅ Tell parent to remove from state
        onDeleteSuccess?.(checkoutId, bookId);
      } else {
        toast.error(res.data.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting checkout:", error);
      toast.error("Error deleting checkout");
    }
  };

  return (
    <DropdownMenuContent
      className="w-48 bg-[#181818] border-[#2F2F2F]"
      align="end"
    >
      <DropdownMenuGroup className="text-white">
        <DropdownMenuItem onClick={handleToggleStatus}>
          {status === "approved" ? "Pending" : "Approved"}
        </DropdownMenuItem>

        <DropdownMenuItem className="text-white" onClick={onView}>
          View
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#2F2F2F]" />
        <DropdownMenuItem
          className="flex items-center gap-2 text-red-500"
          onClick={handleDelete}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuGroup>
    </DropdownMenuContent>
  );
};

export default Options;
