import { useSearchContext } from "@/context/SearchContext";
import { Search } from "lucide-react";

const SearchBar = () => {
  const { searchQuery, setSearchQuery, searchType } = useSearchContext();

  const placeholderMap: Record<typeof searchType, string> = {
    bookstore: "Search books...",
    checkouts: "Search checkouts...",
    transactions: "Search transactions...",
    default: "Search...",
  };

  return (
    <div className="flex items-center bg-[#171717] rounded-md shadow-md px-4 py-2 border-2 border-[#424242]">
      <Search className="w-5 h-5 text-gray-500 mr-2" />
      <input
        type="text"
        className="flex-grow outline-none text-white placeholder-[#A1A1A1] placeholder:italic"
        placeholder={placeholderMap[searchType]}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
