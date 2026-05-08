import type { Book } from "@/types/book";
import { createContext, useContext, useState } from "react";

interface BookContextType {
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
}

const BookContext = createContext<BookContextType | null>(null);

export const BookProvider = ({ children }: any) => {
  const [books, setBooks] = useState<Book[]>([]);

  return (
    <BookContext.Provider value={{ books, setBooks }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBookContext = () => {
  const context = useContext(BookContext);
  if (!context) throw new Error("useBookContext must be used inside BookProvider");
  return context;
};
