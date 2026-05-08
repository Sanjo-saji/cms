import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DialogClose } from "@radix-ui/react-dialog";

interface CheckFooterProps {
  registerNumber: string;
  setRegisterNumber: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const CheckFooter = ({
  registerNumber,
  setRegisterNumber,
  onConfirm,
  onCancel,
}: CheckFooterProps) => {
  return (
    <DialogFooter className="flex justify-between">
      <Input
        placeholder="Enter Register Number"
        className="text-white"
        value={registerNumber}
        min={1}
        onChange={(e) => setRegisterNumber(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <DialogClose asChild>
          <Button
            variant="outline"
            className="bg-[#151515] text-white border-[#383838] hover:bg-[#363636] hover:text-white"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="button"
          onClick={onConfirm}
          className="bg-[#E5E5E5] text-black hover:bg-[#cfcfcf] hover:text-black"
        >
          Confirm
        </Button>
      </div>
    </DialogFooter>
  );
};

export default CheckFooter;
