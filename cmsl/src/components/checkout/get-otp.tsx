import { useEffect, useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import API from "@/Api/api";
import { toast } from "react-hot-toast";

interface GetOtpProps {
  studentId: string;
  setOpen: (open: boolean) => void; // ← pass modal close function directly
  onSuccess: () => void;
}

const GetOtp = ({ studentId, setOpen, onSuccess }: GetOtpProps) => {
  const [otpValue, setOtpValue] = useState("");

  useEffect(() => {
    if (otpValue.length === 6) {
      const confirmOtp = async () => {
        try {
          const res = await API.post("/data/confirm-otp", {
            studentId,
            otp: otpValue,
          });

          if (res.data.success) {
            toast.success("Checkout confirmed successfully!");
            localStorage.removeItem("shopBooks");
            window.dispatchEvent(new Event("shopBooksUpdated"));
            setOpen(false); // ← automatically close the modal
            onSuccess();
          } else {
            toast.error(res.data.message || "Failed to confirm OTP");
          }
        } catch (error) {
          console.error("Error confirming OTP:", error);
          toast.error("Error confirming OTP");
        }
      };

      confirmOtp();
    }
  }, [otpValue, studentId, setOpen]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-xl text-white font-semibold">Enter OTP</h2>
      <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
        <InputOTPGroup className="">
          <InputOTPSlot index={0} className="text-white" />
          <InputOTPSlot index={1} className="text-white" />
          <InputOTPSlot index={2} className="text-white" />
          <InputOTPSlot index={3} className="text-white" />
          <InputOTPSlot index={4} className="text-white" />
          <InputOTPSlot index={5} className="text-white" />
        </InputOTPGroup>
      </InputOTP>
      <p className="text-gray-400 text-sm">
        OTP will auto-submit and close when correct.
      </p>
    </div>
  );
};

export default GetOtp;
