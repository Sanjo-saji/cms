import { Checkbox } from "@/components/ui/checkbox";

interface CheckCardProps {
  image: string;
  title: string;
  author: string;
  isbn: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const CheckCard = ({
  image,
  title,
  author,
  isbn,
  checked,
  onCheckedChange,
}: CheckCardProps) => {
  return (
    <div className="flex border p-1.5 pr-3.5 rounded-md justify-between items-center gap-4 border-[#232323]">
      <div className="flex items-center gap-4">
        <img
          src={image}
          alt="Book"
          className="w-20 h-20 object-cover rounded-md"
        />
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-300">{author}</p>
          <p className="text-xs text-gray-500">ISBN: {isbn}</p>
        </div>
      </div>
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="size-7 border-gray-300 data-[state=checked]:bg-white data-[state=checked]:text-black"
      />
    </div>
  );
};

export default CheckCard;
