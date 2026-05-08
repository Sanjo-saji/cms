import { Button } from "@/components/ui/button";

const DetailsFooter = ({
  onBack,
  onGetOtp,
}: {
  onBack: () => void;
  onGetOtp: () => void;
}) => {
  return (
    <div className="flex justify-between items-center mt-11">
      <Button
        onClick={onBack}
       className="bg-[#151515] text-white border-[#383838] hover:bg-[#363636] hover:text-white"
      >
        Back
      </Button>
      <Button
        onClick={onGetOtp}
        variant="outline"
          className="bg-[#E5E5E5] text-black hover:bg-[#cfcfcf] hover:text-black"
      >
        Get OTP
      </Button>
    </div>
  );
};

export default DetailsFooter;
