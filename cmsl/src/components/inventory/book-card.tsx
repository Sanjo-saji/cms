import { Button } from "../ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Alert from "../global/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import Model from "../global/model";
import API from "@/Api/api";

interface BookCardProps {
  image?: string;
  name: string;
  author: string;
  description?: string;
  isbn: string;
  count: number;
  onClick?: () => void;
  onDelete?: (isbn: number | string) => void;
}

const BookCard = ({
  name,
  image,
  author,
  onClick,
  description,
  isbn,
  count,
  onDelete,
}: BookCardProps) => {
  const [openAlert, setopenAlert] = useState<boolean>(false);
  const [ModelOpen, setModelOpen] = useState<boolean>(false);
  const [modelMode, setModelMode] = useState<"add" | "edit">("add");

  const authors = author ? author.split(",") : [];
  const [currentAuthorIndex, setCurrentAuthorIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (authors.length <= 1) return;

    const interval = setInterval(() => {
      setOpacity(0);

      setTimeout(() => {
        setCurrentAuthorIndex((prev) => (prev + 1) % authors.length);
        setOpacity(1);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [authors]);

  const handleEditClick = () => {
    setModelMode("edit");
    setModelOpen(true);
  };

  const handleDeleteClick = async () => {
    try {
      await API.delete(`/data/delete-library-book/${isbn}`)
        .then((response) => {
          if (response.data.success) {
            onDelete?.(isbn); // Call the onDelete callback if provided
            // Handle successful deletion, e.g., refresh book list or show a success message
          } else {
            console.error("Failed to delete book:", response.data.message);
          }
        })
        .catch((error) => {
          console.error("Error deleting book:", error);
        });
    } catch (error) {
      console.error("Error in handleDeleteClick:", error);
    }
  };

  return (
    <div className="relative flex flex-col justify-center items-center bg-[#181818] border-b border-[#27272A] ml-3 mt-4 rounded-md">
      <div className="absolute top-1 -right-2 ">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              aria-label="Open menu"
              size="icon"
              className="text-white text-xl hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              ⋮
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-50 bg-[#181818] border-[#2F2F2F]">
            <DropdownMenuItem
              className="group flex items-center gap-2 hover:bg-transparent text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick();
              }}
            >
              <Pencil className="w-4 h-4 text-white group-hover:text-black" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem
              className="flex items-center gap-2 text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                setopenAlert(true);
              }}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div
        onClick={() => {
          onClick?.();
        }}
        className="py-3 px-5"
      >
        <img
          src={image}
          alt="Book"
          className="w-40 h-[200px] rounded-md mt-1"
        />
        <p className="mt-3 text-white text-xl font-semibold truncate max-w-[180px] text-center">
          {name}
        </p>
        <p
          className="mt-3 text-white text-[12px] font-semibold text-center transition-opacity duration-500"
          style={{ opacity }}
        >
          {authors[currentAuthorIndex]}
        </p>
      </div>
      {/* Alert */}
      <Alert
        open={openAlert}
        setOpen={setopenAlert}
        title="Delete this book?"
        description={`Are you sure you want to delete "${name}" from your inventory? This action is permanent.`}
        cancelText="No, keep it"
        confirmText="Yes, delete it"
        onConfirm={() => {
          handleDeleteClick();
          setopenAlert(false);
        }}
      />
      {/* Model */}
      <Model
        open={ModelOpen}
        setOpen={setModelOpen}
        mode={modelMode}
        bookData={{
          name: name ?? "",
          image: image ?? "",
          author: author ?? "",
          description: description ?? "",
          isbn: isbn ?? "",
          count,
        }}
      />
    </div>
  );
};

export default BookCard;
