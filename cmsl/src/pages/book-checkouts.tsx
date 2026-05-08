import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Options from "@/components/book-checkouts/options";
import { useState, useEffect } from "react";
import API from "@/Api/api";
import ProfileView from "@/components/book-checkouts/profile-view";
import { useSearchContext } from "@/context/SearchContext";
import toast from "react-hot-toast";

const BookCheckouts = () => {
  const [checkouts, setCheckouts] = useState<any[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const { searchQuery, setSearchType } = useSearchContext();

  const fetchStudentProfile = async (register: string) => {
    setLoadingProfile(true);
    try {
      const res = await API.get(`/data/get-student-profile/${register}`);
      if (res.data.success) {
        setSelectedStudent(res.data);
        setIsProfileOpen(true);
      }
    } catch (error) {
      toast.error("Error fetching student profile: " + error);
      console.error("Error fetching student profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchCheckouts = async () => {
    try {
      const res = await API.get("/data/get-all-checkout-details");
      if (res.data.success) {
        setCheckouts(res.data.data);
      }
    } catch (error) {
      toast.error("Error fetching checkouts: " + error);
      console.error("Error fetching checkouts:", error);
    }
  };

  useEffect(() => {
    setSearchType("checkouts");
    fetchCheckouts();
  }, [setSearchType]);

  //  Remove deleted item from state
  const handleDeleteFromState = (checkoutId: string, bookId?: string) => {
    setCheckouts((prev) =>
      prev.filter(
        (item) => !(item.checkoutId === checkoutId && item.bookId === bookId)
      )
    );
  };

  const filteredCheckouts = checkouts.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.studentName.toLowerCase().includes(query) ||
      item.bookName.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query) ||
      item.studentRegister?.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <div className="w-[93%] mx-auto mb-7 mt-10 border border-[#2F2F2F] rounded-lg overflow-hidden">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-[#27272A] text-white border-none">
              <TableHead className="w-[100px] text-white font-bold">
                No
              </TableHead>
              <TableHead className="text-white font-bold">Name</TableHead>
              <TableHead className="text-white font-bold">Book</TableHead>
              <TableHead className="text-white font-bold">Status</TableHead>
              <TableHead className="text-white font-bold">Date</TableHead>
              <TableHead className="text-white font-bold">Due</TableHead>
              <TableHead className="text-white font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCheckouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400">
                  No matching checkouts found.
                </TableCell>
              </TableRow>
            ) : (
              filteredCheckouts.map((item, index) => (
                <TableRow
                  key={`${item.checkoutId}-${item.bookId}`}
                  className="bg-[#0A0A0A] border-none hover:bg-[#181818] transition-colors"
                >
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{item.studentName}</TableCell>
                  <TableCell>{item.bookName}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        item.status === "approved"
                          ? "text-[#198754] border-[#198754]"
                          : "text-yellow-500 border-yellow-500"
                      }
                    >
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(item.checkoutDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(item.dueDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          aria-label="Open menu"
                          size="icon"
                          className="bg-transparent border-none hover:bg-[#2C2C2C] focus-visible:ring-0 focus-visible:ring-offset-0"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-400 cursor-pointer" />
                        </Button>
                      </DropdownMenuTrigger>
                      <Options
                        checkoutId={item.checkoutId}
                        bookId={item.bookId}
                        status={item.status}
                        onStatusUpdated={fetchCheckouts}
                        onDeleteSuccess={handleDeleteFromState}
                        onView={() => fetchStudentProfile(item.studentRegister)}
                      />
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <ProfileView
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        student={selectedStudent?.student}
        stats={selectedStudent?.stats}
        transactions={selectedStudent?.books}
        loading={loadingProfile}
      />
    </>
  );
};

export default BookCheckouts;
