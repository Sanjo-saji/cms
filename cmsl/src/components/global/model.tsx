import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import API from "@/Api/api";
import { useBookContext } from "@/context/BookContext";

interface ModelProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  mode: "add" | "edit";
  bookData?: {
    name: string;
    author: string;
    description?: string;
    isbn: string;
    count: number;
    image: string;
  };
}

const Model = ({ open, setOpen, mode, bookData }: ModelProps) => {
  const [isbn, setIsbn] = useState("");
  const [count, setCount] = useState("");
  const [bookInfo, setBookInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { setBooks } = useBookContext();

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  useEffect(() => {
    if (mode === "add") {
      setIsbn("");
      setCount("");
      setBookInfo(null);
    } else if (mode === "edit" && bookData) {
      setIsbn(bookData.isbn);
      setCount(String(bookData.count));
    }
  }, [open, mode, bookData]);

  const handleSearch = async () => {
    if (!isbn) return alert("Please enter ISBN");
    try {
      setLoading(true);
      const response = await API.get(`/data/search-book-by-isbn?isbn=${isbn}`);
      if (response.data.success) {
        setBookInfo(response.data.book);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error searching book");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!isbn || !count) return alert("Please enter ISBN and count");
    try {
      setLoading(true);
      const payload = { ISBN: isbn, count };
      const response = await API.post("/data/add-library-book", payload);
      if (response.data.success) {
        alert("Book added successfully!");
        setOpen(false);
        const res = await API.get("/data/get-all-library-books");
        if (res.data.success) {
          setBooks(res.data.books);
        }
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error adding book");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!isbn || !count) return alert("Please enter ISBN and count");
    try {
      setLoading(true);
      const response = await API.put(`/data/update-library-book?isbn=${isbn}`, {
        count: Number(count),
      });
      if (response.data.success) {
        alert("Book updated successfully!");
        setOpen(false);
        const res = await API.get("/data/get-all-library-books");
        if (res.data.success) {
          setBooks(res.data.books);
        }
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error updating book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[425px] bg-[#0A0A0A] border-[#232323]"
        onClick={stop}
      >
        {/* ----------------- ADD MODE ----------------- */}
        {mode === "add" && (
          <>
            <Label htmlFor="isbn" className="text-white">ISBN Number</Label>
            <div className="flex gap-2">
              <Input
                id="isbn"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="Enter ISBN Number"
                className="text-white"
              />
              <Button
                type="button"
                onClick={handleSearch}
                className="px-5 py-2 bg-[#E5E5E5] text-black hover:bg-[#cfcfcf]"
                disabled={loading}
              >
                Search
              </Button>
            </div>

            {bookInfo && (
              <>
                <div className="flex items-center gap-3.5 mt-4">
                  <img
                    src={bookInfo.cover}
                    alt="Book Cover"
                    className="border-2 border-[#232323] h-32 w-24 rounded"
                  />
                  <div>
                    <p className="text-white text-lg font-bold">{bookInfo.title}</p>
                    <p className="text-gray-300">{bookInfo.authors?.join(", ")}</p>
                  </div>
                </div>
                <div className="grid w-full gap-3 mt-6">
                  <Label className="text-white">Description</Label>
                  <div className="text-gray-300 text-sm max-h-40 overflow-y-auto p-2 border border-[#2c2c2c] rounded">
                    {bookInfo.description || "No description available"}
                  </div>
                </div>

                <Label htmlFor="count" className="text-white mt-4">Count</Label>
                <Input
                  id="count"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  placeholder="Enter count"
                  className="text-white"
                />
              </>
            )}
          </>
        )}

        {/* ----------------- EDIT MODE ----------------- */}
        {mode === "edit" && bookData && (
          <>
            <div className="flex items-center gap-3.5 mt-4">
              <img
                src={bookData.image}
                alt="Book Cover"
                className="border-2 border-[#232323] h-32 w-24 rounded"
              />
              <div>
                <p className="text-white text-lg font-bold">{bookData.name}</p>
                <p className="text-gray-300">{bookData.author}</p>
              </div>
            </div>
            <div className="grid w-full gap-3 mt-6">
              <Label className="text-white">Description</Label>
              <div className="text-gray-300 text-sm max-h-40 overflow-y-auto p-2 border border-[#2c2c2c] rounded">
                {bookData.description || "No description available"}
              </div>
            </div>

            <Label className="text-white mt-4">ISBN Number</Label>
            <div className="text-gray-300 text-sm border border-[#2c2c2c] rounded p-2">
              {isbn}
            </div>

            <Label htmlFor="count" className="text-white mt-4">Count</Label>
            <Input
              id="count"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="Book Count"
              className="text-white"
            />
          </>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              type="button"
              onClick={(e) => {
                stop(e);
                setOpen(false);
              }}
              className="bg-[#151515] text-white border-[#383838] hover:bg-[#363636]"
            >
              Cancel
            </Button>
          </DialogClose>

          {mode === "add" && bookInfo && (
            <Button
              type="button"
              disabled={loading}
              onClick={handleAdd}
              className="bg-[#E5E5E5] text-black hover:bg-[#cfcfcf]"
            >
              Add Book
            </Button>
          )}

          {mode === "edit" && (
            <Button
              type="button"
              disabled={loading}
              onClick={handleUpdate}
              className="bg-[#E5E5E5] text-black hover:bg-[#cfcfcf]"
            >
              Update
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Model;
