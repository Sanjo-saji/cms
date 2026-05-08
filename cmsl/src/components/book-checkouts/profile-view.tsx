// ProfileView.tsx
import { Drawer, DrawerContent } from "../ui/drawer";
import man from "@/assets/man.jpg";

interface Transaction {
  title: string;
  status: string;
}

interface Stats {
  totalBooks: number;
  pendingBooks: number;
}

interface StudentProfile {
  name: string;
  register: string;
  course: string;
  semster: string;
  image: string;
}

interface ProfileViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: StudentProfile;
  stats?: Stats;
  transactions?: Transaction[];
  loading?: boolean;
  image?: string;
}

const ProfileView = ({
  open,
  onOpenChange,
  student,
  stats,
  transactions,
  loading,
}: ProfileViewProps) => {
  if (loading) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} direction="right">
        <DrawerContent className="bg-[#0A0A0A] text-white border-l border-[#232323] p-6 w-[380px] flex justify-center items-center">
          <p>Loading...</p>
        </DrawerContent>
      </Drawer>
    );
  }

  if (!student) return null;
  console.log(student.image);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-[#0A0A0A] text-white border-l border-[#232323] p-6 w-[380px]">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={student.image || man}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-[#232323] shadow-lg object-cover"
            />
            <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0A0A0A]" />
          </div>
          <h2 className="mt-4 text-2xl font-bold">{student.name}</h2>
          <p className="text-gray-400 text-sm">
            {student.course} {student.semster} • Register No: {student.register}
          </p>
        </div>

        {/* Divider */}
        <div className="my-6 h-[1px] w-full bg-[#232323]" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-[#181818] p-4 rounded-xl shadow-md">
            <p className="text-3xl font-bold text-yellow-400">
              {stats?.pendingBooks ?? 0}
            </p>
            <p className="text-gray-400 text-sm">Pending Books</p>
          </div>
          <div className="bg-[#181818] p-4 rounded-xl shadow-md">
            <p className="text-3xl font-bold text-green-500">
              {stats?.totalBooks ?? 0}
            </p>
            <p className="text-gray-400 text-sm">Total Books</p>
          </div>
        </div>

        {/* Recent Transactions */}
        {transactions && transactions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
            <div className="max-h-9/12  overflow-y-auto pr-2 custom-scroll">
              <ul className="space-y-3">
                {transactions.map((tx, idx) => (
                  <li
                    key={idx}
                    className="bg-[#181818] p-3 rounded-lg flex justify-between items-center"
                  >
                    <span className="text-sm">📖 {tx.title}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        tx.status === "approved"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default ProfileView;
