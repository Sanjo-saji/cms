import { NavbarIcons } from "@/constants/image-constant";
import ProfileModel from "./profile-model";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [open, setOpen] = useState(false);
  const ProfileIcon = NavbarIcons.profile;
  const navigate = useNavigate();
  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleProfileClick = () => {
    console.log("Profile clicked");
    setOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 rounded-full hover:bg-[#27272A] transition-colors">
            <img src={ProfileIcon} alt="profile" className="w-8 h-8" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-52 z-50 bg-[#181818] border-[#2F2F2F] text-white"
          align="start"
        >
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleProfileClick}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileModel open={open} onOpenChange={setOpen} />
    </>
  );
};

export default Profile;
