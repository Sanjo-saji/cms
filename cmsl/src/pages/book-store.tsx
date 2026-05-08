// BookStore.tsx
import Model from "@/components/global/model";
import RightDrawer from "@/components/global/right-drawer";
import BookCard from "@/components/inventory/book-card";
import { Button } from "@/components/ui/button";
import API from "@/Api/api";
import { useEffect, useState } from "react";
import { useBookContext } from "@/context/BookContext";
import { useSearchContext } from "@/context/SearchContext";
import toast from "react-hot-toast";

const BookStore = () => {
  const { books, setBooks } = useBookContext();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [modelMode, setModelMode] = useState<"add" | "edit">("add");
  const [selectedBook, setSelectedBook] = useState<any>(null);

  // Fetch books only if not already in context
  useEffect(() => {
    if (books.length > 0) {
      setLoading(false);
      return;
    }

    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await API.get("/data/get-all-library-books");
        if (response.data.success) {
          setBooks(response.data.books);
        } else {
          toast.error("Failed to fetch books");
          console.error("Failed to fetch books");
        }
      } catch (error) {
        toast.error("Error fetching books: " + error);
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [books, setBooks]);

  const { searchQuery, setSearchType } = useSearchContext();

  useEffect(() => {
    setSearchType("bookstore"); // mark current page
  }, [setSearchType]);

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.authors?.join(", ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddBook = () => {
    setModelMode("add");
    setModelOpen(true);
  };

  return (
    <div>
      {/* Right drawer for book details */}
      <RightDrawer
        open={drawerOpen}
        setOpen={setDrawerOpen}
        bookDetails={selectedBook}
        buttonLabel="Edit Book"
      />

      {/* Add Book button */}
      <div className="flex justify-end mr-4 mt-4">
        <Button
          onClick={handleAddBook}
          className="py-2 px-8 bg-[#E5E5E5] text-black hover:bg-[#c7c7c7]"
        >
          Add Book
        </Button>
      </div>

      {/* Book grid */}
      {loading ? (
        <div className="flex justify-center items-center h-[300px] text-lg font-semibold">
          Loading books...
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 mx-5 my-5">
          {filteredBooks.map((book, i) => (
            <BookCard
              key={i}
              image={book.cover ?? undefined}
              name={book.title}
              author={book.authors?.join(", ")}
              description={book.description}
              count={book.count}
              isbn={String(book.isbn)}
              onClick={() => {
                setDrawerOpen(true);
                setSelectedBook({
                  title: book.title,
                  image: book.cover,
                  author: book.authors?.join(", "),
                  quantity: book.count,
                  publishedDate: book.publish_date,
                  description: book.description ?? "No description available",
                });
              }}
              onDelete={(isbn) => {
                // Handle delete book logic
                const updatedBooks = books.filter((book) => book.isbn !== isbn);
                setBooks(updatedBooks);
              }}
            />
          ))}
        </div>
      )}

      {/* Add/Edit book modal */}
      <Model open={modelOpen} setOpen={setModelOpen} mode={modelMode} />
    </div>
  );
};

export default BookStore;
