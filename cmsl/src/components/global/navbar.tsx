import SearchBar from "./Navbar/search-bar";
import Store from "./Navbar/store";
import Profile from "./Navbar/profile";
import Checkout from "./Navbar/checkout";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSearchContext } from "@/context/SearchContext";

const Navbar = () => {
  const location = useLocation();
  const { setSearchQuery } = useSearchContext();
  useEffect(() => {
    setSearchQuery(""); // reset on route change
  }, [location.pathname]);
  return (
    <nav className="flex items-center justify-end px-4  py-2 bg-[#0A0A0A] border-b border-[#232323]">
      <div className="flex items-center gap-6 mr-4">
        <SearchBar />
        <Checkout />
        <Store />
        <Profile />
      </div>
    </nav>
  );
};

export default Navbar;
