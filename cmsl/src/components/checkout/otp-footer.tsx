import { Button } from "@/components/ui/button";

const OtpFooter = ({ onBack }: { onBack: () => void }) => {
  return (
    <Button
      onClick={onBack}
      className="bg-[#151515] text-white border-[#383838] hover:bg-[#363636] hover:text-white w-24"
    >
      Back
    </Button>
  );
};

export default OtpFooter;
