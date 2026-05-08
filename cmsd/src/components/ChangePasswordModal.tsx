import { useState } from "react";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ open, onClose }: Props) {
  const [form, setForm] = useState({
    password: "",
    newPassword: "",
    confirmPass: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChangePassword = async () => {
    if (form.newPassword !== form.confirmPass) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      await api.put("/auth/update-password", form);
      toast.success("Password updated successfully!");
      onClose();
      setForm({ password: "", newPassword: "", confirmPass: "" });
    } catch (err) {
      toast.error("Error changing password!");
    }
  };

  const togglePassword = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {/* Current password */}
          <div className="relative">
            <Input
              type={showPassword.current ? "text" : "password"}
              placeholder="Current Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => togglePassword("current")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* New password */}
          <div className="relative">
            <Input
              type={showPassword.new ? "text" : "password"}
              placeholder="New Password"
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => togglePassword("new")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm password */}
          <div className="relative">
            <Input
              type={showPassword.confirm ? "text" : "password"}
              placeholder="Confirm New Password"
              value={form.confirmPass}
              onChange={(e) =>
                setForm({ ...form, confirmPass: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => togglePassword("confirm")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleChangePassword}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
