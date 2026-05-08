// context/SearchContext.tsx
import { createContext, useContext, useState } from "react";

type SearchType = "bookstore" | "checkouts" | "transactions" | "default";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("default");

  return (
    <SearchContext.Provider
      value={{ searchQuery, setSearchQuery, searchType, setSearchType }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used inside SearchProvider");
  }
  return context;
};
