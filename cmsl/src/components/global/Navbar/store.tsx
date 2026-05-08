import { NavbarIcons } from "@/constants/image-constant";
import CheckModel from "../check-model";
import { useState, useEffect } from "react";

const Store = () => {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const handleOpen = () => {
    setOpen(true);
  };

  const StoreIcon = NavbarIcons.store;
  useEffect(() => {
    const updateCount = () => {
      const stored = localStorage.getItem("shopBooks");
      if (stored) {
        try {
          const books = JSON.parse(stored);
          setCartCount(books.length || 0);
        } catch {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    // Initial load
    updateCount();

    // 🔥 Listen for changes
    window.addEventListener("shopBooksUpdated", updateCount);

    return () => {
      window.removeEventListener("shopBooksUpdated", updateCount);
    };
  }, []);

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-[#27272A] transition-colors"
        title="Book Cart"
        onClick={handleOpen}
      >
        <img src={StoreIcon} alt="store" className="w-8 h-8" />

        {/* Badge */}
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md">
            {cartCount}
          </span>
        )}
      </button>

      <CheckModel open={open} setOpen={setOpen} />
    </div>
  );
};

export default Store;
