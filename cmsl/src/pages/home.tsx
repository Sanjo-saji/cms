import { useBookContext } from "@/context/BookContext";
import RightDrawer from "@/components/global/right-drawer";
import Card from "@/components/Home/card";
import API from "@/Api/api";
import { useEffect, useState } from "react";
import { useSearchContext } from "@/context/SearchContext";
import toast from "react-hot-toast";

const Home = () => {
  const { books, setBooks } = useBookContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const { searchQuery, setSearchType } = useSearchContext();

  useEffect(() => {
    setSearchType("bookstore");
  }, [setSearchType]);

  useEffect(() => {
    if (books.length > 0) {
      setLoading(false);
      console.log("books", books);
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
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.authors?.join(", ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler to save book to local storage
  const handleAddToShop = (book: {
    title: string;
    image: string;
    author: string;
    isbn: string;
  }) => {
    const existing = JSON.parse(localStorage.getItem("shopBooks") || "[]");
    const newBook = {
      title: book.title,
      image: book.image,
      author: book.author,
      isbn: book.isbn,
    };
    const updated = [...existing, newBook];
    localStorage.setItem("shopBooks", JSON.stringify(updated));
    window.dispatchEvent(new Event("shopBooksUpdated"));
    toast.success("Book added to shop!");
  };

  return (
    <div>
      <RightDrawer
        open={openDrawer}
        setOpen={setOpenDrawer}
        bookDetails={selectedBook}
        buttonLabel="Add to Shop"
      />

      {loading ? (
        <div className="flex justify-center items-center h-[300px] text-lg font-semibold">
          Loading books...
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 mx-5 my-5">
          {filteredBooks.map((book, i) => (
            <div
              key={i}
              onClick={() => {
                setSelectedBook({
                  title: book.title,
                  image: book.cover,
                  author: book.authors?.join(", "),
                  quantity: book.count,
                  publishedDate: book.publish_date,
                  description: book.description,
                });
                setOpenDrawer(true);
              }}
            >
              <Card
                image={book.cover ?? undefined}
                bookName={book.title}
                author={book.authors?.join(", ")}
                onAddShop={() =>
                  handleAddToShop({
                    title: book.title,
                    image: book.cover ?? "",
                    author: book.authors?.join(", ") ?? "",
                    isbn: String(book.isbn),
                  })
                }
                count={book.count}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
