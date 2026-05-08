import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import API from "@/Api/api";
import { useSearchContext } from "@/context/SearchContext";

interface TransactionData {
  transactionId: string;
  studentId: string;
  studentName: string;
  ISBN: string;
  bookTitle: string;
  status: string;
  checkoutDate: string;
  dueDate: string;
}

const Transaction = () => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery, setSearchType } = useSearchContext();

  useEffect(() => {
    setSearchType("transactions"); // mark current page
  }, [setSearchType]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await API.get("/data/get-all-transaction-details");
        if (res.data && res.data.success) {
          setTransactions(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTxns = transactions.filter((txn) => {
    const query = searchQuery.toLowerCase();
    return (
      txn.studentName.toLowerCase().includes(query) ||
      txn.bookTitle.toLowerCase().includes(query) ||
      txn.status.toLowerCase().includes(query) ||
      txn.ISBN.toLowerCase().includes(query)
    );
  });

  return (
    <Table className="w-[95%] mx-auto mt-10 border border-[#2F2F2F]">
      <TableCaption>A list of all book transactions.</TableCaption>

      {/* Table Header */}
      <TableHeader>
        <TableRow>
          <TableHead className="w-[60px] text-white font-bold">No</TableHead>
          <TableHead className="text-white font-bold">Name</TableHead>
          <TableHead className="text-white font-bold">Book Name</TableHead>
          <TableHead className="text-white font-bold">Status</TableHead>
          <TableHead className="text-white font-bold">Date</TableHead>
          <TableHead className="text-white font-bold">Due</TableHead>
        </TableRow>
      </TableHeader>

      {/* Table Body */}
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-gray-400">
              Loading...
            </TableCell>
          </TableRow>
        ) : filteredTxns.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-gray-400">
              No matching transactions found.
            </TableCell>
          </TableRow>
        ) : (
          filteredTxns.map((txn, idx) => (
            <TableRow
              key={txn.transactionId}
              className={`${
                idx % 2 === 0 ? "bg-[#181818]" : "bg-[#0A0A0A]"
              } border-b border-[#27272A]`}
            >
              <TableCell className="font-medium">{idx + 1}</TableCell>
              <TableCell>{txn.studentName}</TableCell>
              <TableCell>{txn.bookTitle}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    txn.status === "approved"
                      ? "text-[#198754] border-[#198754]"
                      : txn.status === "pending"
                      ? "text-[#FFC107] border-[#FFC107]"
                      : "text-red-500 border-red-500"
                  }
                >
                  {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                {txn.checkoutDate
                  ? new Date(txn.checkoutDate).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell>
                {txn.dueDate ? new Date(txn.dueDate).toLocaleDateString() : "-"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default Transaction;
