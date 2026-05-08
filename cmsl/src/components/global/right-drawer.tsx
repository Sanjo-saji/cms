import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";
import Book from "@/assets/book.jpeg";

interface RightDrawerProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  bookDetails?: {
    title: string;
    image: string;
    author: string;
    quantity: number;
    publishedDate: string;
    description: string;
  };
  buttonLabel?: string;
}

const RightDrawer = ({ open, setOpen, bookDetails }: RightDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerContent className="bg-[#0A0A0A] text-white border-2 border-[#232323]">
        {/* Scrollable container */}
        <div className="overflow-y-auto max-h-[calc(100vh-150px)] px-6 mt-4">
          <div className="flex justify-center mb-4 w-full h-[500px]">
            <img
              src={bookDetails?.image || Book}
              alt="Book"
              className="object-cover w-full h-full"
            />
          </div>
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-2xl text-white font-bold">
                {bookDetails?.title || "Book Title"}
              </DrawerTitle>
              <p>Quantity: {bookDetails?.quantity || 0}</p>
            </div>
            <DrawerDescription className="text-sm text-gray-200">
              {bookDetails?.author || "Author Name"}
            </DrawerDescription>
            <DrawerDescription className="text-sm text-gray-200">
              Published Date: {bookDetails?.publishedDate || "2025-10-26"}
            </DrawerDescription>
            <DrawerDescription className="text-sm text-gray-400 whitespace-pre-line">
              {bookDetails?.description ||
                "Description of the book goes here. It can be a brief summary or any other relevant information about the book."}
            </DrawerDescription>
          </DrawerHeader>
        </div>

        {/* Footer always visible */}
        <DrawerFooter>
          {/* <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="text-black"
          >
            {buttonLabel || "Add to Cart"}
          </Button> */}
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="bg-[#151515] text-white border-[#383838] hover:bg-[#363636] hover:text-white"
          >
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default RightDrawer;
