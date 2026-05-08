import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AlertProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm?: () => void;
  title?: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
}

const Alert = ({
  open,
  setOpen,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  cancelText = "Cancel",
  confirmText = "Confirm",
}: AlertProps) => {
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent onClick={stop} className="bg-[#0A0A0A] border-[#232323]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-[#9DA1A1]">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={(e) => {
              stop(e);
              setOpen(false);
            }}
            className="bg-[#151515] text-white border-[#383838] hover:bg-[#363636] hover:text-white"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              stop(e);
              onConfirm?.();
              setOpen(false);
            }}
            className="bg-[#E5E5E5] text-black hover:bg-[#cfcfcf] hover:text-black"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Alert;
