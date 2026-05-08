import { useEffect, useState } from "react";
import api from "@/lib/api";
import { logout } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ChangePasswordModal from "./ChangePasswordModal";
import avatar from "../assets/user.png";
export default function ProfileSection() {
  const [profile, setProfile] = useState<any>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    api.get("/auth/get-profile").then((res) => {
      if (res.data.success) {
        setProfile(res.data.data);
      }
    });
  }, []);

  if (!profile) return null;

  return (
    <>
      {/* Profile Row */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center w-full gap-3 px-3 py-2 rounded-lg hover:bg-gray-100">
            <img
              src={profile.image || avatar}
              alt="profile"
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="flex flex-col items-start">
              <span className="font-medium text-gray-900">{profile.name}</span>
              <span className="text-sm text-gray-500">
                {profile.department || "No Department"}
              </span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuItem onClick={() => setOpenDialog(true)}>
            Change Password
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout} className="text-red-600">
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      />
    </>
  );
}
