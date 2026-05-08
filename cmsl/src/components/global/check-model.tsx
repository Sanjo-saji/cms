import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CheckCard from "../checkout/check-card";
import CheckFooter from "../checkout/check-footer";
import CheckDetails from "../checkout/check-details";
import DetailsFooter from "../checkout/details-footer";
import GetOtp from "../checkout/get-otp";
import OtpFooter from "../checkout/otp-footer";
import API from "@/Api/api";
import toast from "react-hot-toast";

interface CheckModelProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface ShopBook {
  isbn: string;
  title: string;
  image: string;
  author: string;
}

const CheckModel = ({ open, setOpen }: CheckModelProps) => {
  const [step, setStep] = useState<"cards" | "details" | "otp">("cards");
  const [shopBooks, setShopBooks] = useState<ShopBook[]>([]);
  const [registerNumber, setRegisterNumber] = useState("");
  const [studentName, setStudentName] = useState("");
  const [delay, setDelay] = useState<string | number>("Nothing");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [bookCount, setBookCount] = useState(0);
  const [checkedBooks, setCheckedBooks] = useState<{ [isbn: string]: boolean }>(
    {}
  );
  const [studentId, setStudentId] = useState<string>("");

  // OTP dialog
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");

  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem("shopBooks");
      if (stored) {
        try {
          const parsed: ShopBook[] = JSON.parse(stored);
          setShopBooks(parsed);

          // Initialize all books as checked by default
          const initialChecked: { [isbn: string]: boolean } = {};
          parsed.forEach((book) => {
            initialChecked[book.isbn] = true;
          });
          setCheckedBooks(initialChecked);
        } catch (error) {
          toast.error("Error parsing shopBooks: " + error);
          console.error("Error parsing shopBooks:", error);
        }
      }
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!registerNumber) {
      toast.error("Please enter register number");
      return;
    }

    if (shopBooks.length === 0) {
      toast.error("No books found in local storage. Please add books first.");
      return;
    }

    try {
      const res = await API.get(
        `/data/get-student-pending-checkout/${registerNumber}`
      );
      const data = res.data;

      if (data.success) {
        setStudentName(data.student.name);
        setStudentId(data.student.id);
        setRegisterNumber(data.student.register);
        setDelay(data.delay);
        setCourse(data.student.course);
        setSemester(data.student.semester);
        setBookCount(shopBooks.length);
        setStep("details");
      } else {
        toast.error(data.message || "Student not found");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast.error("Error fetching student data");
    }
  };

  const handleGetOtp = async () => {
    if (!studentId) {
      toast.error("Student ID is missing");
      return;
    }

    const Books = shopBooks
      .filter((book) => checkedBooks[book.isbn])
      .map((book) => ({
        ISBN: book.isbn,
      }));

    if (Books.length === 0) {
      toast.error("Please select at least one book");
      return;
    }

    console.log("Requesting OTP for student:", studentId, "with books:", Books);

    try {
      const res = await API.post("/data/create-checkout", {
        studentId,
        Books,
      });

      if (res.data.success) {
        setGeneratedOtp(res.data.otp);
        setOtpDialogOpen(true);
        setStep("otp");
      } else {
        toast.error(res.data.message || "Failed to generate OTP");
      }
    } catch (error) {
      console.error("Error generating OTP:", error);
      toast.error("Error generating OTP");
    }
  };

  const handleCancel = () => {
    localStorage.removeItem("shopBooks");
    setShopBooks([]);
    setCheckedBooks({});
    setRegisterNumber("");
  };

  window.dispatchEvent(new Event("shopBooksUpdated"));
  const resetAll = () => {
    setStep("cards");
    localStorage.removeItem("shopBooks");
    setShopBooks([]);
    setCheckedBooks({});
    setRegisterNumber("");
    setStudentName("");
    setStudentId("");
    setDelay("Nothing");
    setBookCount(0);
    setGeneratedOtp("");
  };

  const handleBackToCards = () => setStep("cards");
  const handleBackToDetails = () => setStep("details");

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <form>
          <DialogContent
            className="sm:max-w-[425px] bg-[#0A0A0A] border-[#232323]"
            showCloseButton={false}
            onInteractOutside={(e) => e.preventDefault()}
          >
            {step === "cards" && (
              <>
                <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
                  {shopBooks.map((book) => (
                    <CheckCard
                      key={book.isbn}
                      image={book.image}
                      title={book.title}
                      author={book.author}
                      isbn={book.isbn}
                      checked={checkedBooks[book.isbn]}
                      onCheckedChange={(checked) => {
                        setCheckedBooks((prev) => ({
                          ...prev,
                          [book.isbn]: checked,
                        }));
                      }}
                    />
                  ))}
                </div>
                <CheckFooter
                  registerNumber={registerNumber}
                  setRegisterNumber={setRegisterNumber}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                />
              </>
            )}

            {step === "details" && (
              <>
                <CheckDetails
                  studentName={studentName}
                  registerNumber={registerNumber}
                  bookCount={bookCount}
                  delay={delay}
                  course={course}
                  semester={semester}
                />
                <DetailsFooter
                  onBack={handleBackToCards}
                  onGetOtp={handleGetOtp}
                />
              </>
            )}

            {step === "otp" && (
              <>
                <GetOtp
                  studentId={studentId}
                  setOpen={setOpen}
                  onSuccess={resetAll}
                />
                <OtpFooter onBack={handleBackToDetails} />
              </>
            )}
          </DialogContent>
        </form>
      </Dialog>

      {/* Fancy OTP Dialog */}
      {/* <Dialog open={otpDialogOpen} onOpenChange={setOtpDialogOpen}>
        <DialogContent className="sm:max-w-[300px] bg-[#0A0A0A] border-[#232323] flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Your OTP</h2>
          <div className="bg-white text-black font-bold text-2xl px-6 py-3 rounded-md">
            {generatedOtp}
          </div>
          <p className="text-gray-400 mt-2 text-sm">
            Share this OTP with the student to complete checkout.
          </p>
          <button
            onClick={() => setOtpDialogOpen(false)}
            className="mt-5 px-4 py-2 bg-[#E5E5E5] text-black rounded hover:bg-[#cfcfcf]"
          >
            Close
          </button>
        </DialogContent>
      </Dialog> */}
    </>
  );
};

export default CheckModel;
