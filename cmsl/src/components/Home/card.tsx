import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface CardProps {
  image?: string;
  bookName?: string;
  author?: string;
  onAddShop?: () => void; // new
  count?: number;
}

const Card = ({ image, bookName, author, onAddShop, count }: CardProps) => {
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

  return (
    <div className="flex flex-col justify-center items-center bg-[#181818] border-b border-[#27272A] ml-3 mt-4 py-2 px-2 rounded-md">
      <img src={image} alt="Book" className="w-38 h-40 rounded-md" />
      <p className="mt-3 text-white text-xl font-semibold truncate max-w-[180px]">
        {bookName}
      </p>
      <p
        className="mt-3 text-white text-[12px] font-semibold transition-opacity duration-500"
        style={{ opacity }}
      >
        {authors[currentAuthorIndex]}
      </p>
      <div className="flex items-center mt-2">
        <Button
          className="py-2 px-8 bg-[#E5E5E5] text-black hover:bg-[#c7c7c7]"
          onClick={(e) => {
            e.stopPropagation();
            onAddShop?.();
          }}
          disabled={count === 0} // ✅ disable if no stock
        >
          {count === 0 ? "Out of Stock" : "Add Shop"}
        </Button>
      </div>
    </div>
  );
};

export default Card;
