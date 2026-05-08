import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import man from "@/assets/man.jpg";
import { useEffect, useState } from "react";
import API from "@/Api/api";
interface ProfileModelProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ProfileModel({
  open,
  onOpenChange,
}: ProfileModelProps) {
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [isDepartmentHead, setIsDepartmentHead] = useState(false);
  const [profile, setProfile] = useState("");
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await API.get("/data/get-teacher-profile");
        console.log("Profile Data Response:", response.data);
        if (response.data.profile) {
          const { name, employeeId, role, department, departmentHead, image } =
            response.data.profile;
          setName(name);
          setEmployeeId(employeeId);
          setRole(role);
          setDepartment(department);
          setIsDepartmentHead(departmentHead);
          setProfile(image);
        } else {
          console.error("Failed to fetch profile data");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[400px] bg-gradient-to-b from-[#111111] to-[#1A1A1A] 
               border border-[#2F2F2F] rounded-3xl shadow-2xl p-6
               fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        {/* Close Button White */}
        <button
          onClick={() => onOpenChange?.(false)}
          className="absolute top-4 right-4 text-white text-lg hover:text-blue-400 transition"
        >
          ✕
        </button>

        {/* Profile Content */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-purple-500 shadow-xl">
              <img
                src={profile || man}
                alt="John Doe"
                className="w-full h-full rounded-full object-cover border-4 border-[#0A0A0A]"
              />
            </div>
            <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-400 rounded-full border-2 border-[#0A0A0A] shadow" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white hover:text-blue-400 transition">
            {name}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Employee ID: {employeeId}
          </p>
        </div>

        {/* Info Cards */}
        <div className="my-6 flex flex-col gap-4">
          <div className="bg-[#1F1F1F] p-3 rounded-xl flex justify-between items-center shadow-md hover:shadow-lg transition">
            <Label className="text-gray-400">Role: {role}</Label>
            <span className="text-blue-400 font-semibold">{role}</span>
          </div>
          <div className="bg-[#1F1F1F] p-3 rounded-xl flex justify-between items-center shadow-md hover:shadow-lg transition">
            <Label className="text-gray-400">Department:</Label>
            <span className="text-purple-400 font-semibold">{department}</span>
          </div>
          <div className="bg-[#1F1F1F] p-3 rounded-xl flex justify-between items-center shadow-md hover:shadow-lg transition">
            <Label className="text-gray-400">Department Head:</Label>
            <span className="text-green-400 font-semibold">
              {isDepartmentHead ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
