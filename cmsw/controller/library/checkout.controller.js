import Checkout from "../../model/library/checkout.model.js";
import Transaction from "../../model/library/transation.model.js";
import Library from "../../model/library/library.model.js";
import Student from "../../model/student/student.model.js";
import Teacher from "../../model/teachers/teachers.model.js";
import StudentOtp from "../../model/library/otp.model.js";
import axios from "axios";
import moment from "moment";

export const createCheckout = async (req, res) => {
  try {
    const teacherId = req.user.id;
    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const { studentId, Books } = req.body;

    if (!studentId || !Books || Books.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "studentId and Books are required" });
    }

    // Check student
    const student = await Student.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const booksToSave = [];

    // Validate and convert ISBNs to bookId
    for (const book of Books) {
      if (!book.ISBN) {
        return res
          .status(400)
          .json({ success: false, message: "ISBN is required for each book" });
      }

      const foundBook = await Library.findOne({ ISBN: book.ISBN });
      if (!foundBook) {
        return res.status(404).json({
          success: false,
          message: `Book not found for ISBN: ${book.ISBN}`,
        });
      }

      booksToSave.push({ bookId: foundBook._id });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 10);

    // Save OTP doc temporarily with resolved bookIds
    await StudentOtp.findOneAndUpdate(
      { studentId },
      { otp, otpExpires, books: booksToSave },
      { upsert: true, new: true }
    );

    return res.status(201).json({
      success: true,
      message: "OTP generated. Student must confirm to complete checkout.",
      otp, // optional: only for dev/test
    });
  } catch (error) {
    console.error("❌ Error in createCheckout:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getAllCheckoutDetails = async (req, res) => {
  try {
    const checkouts = await Checkout.find({})
      .sort({ checkoutDate: -1 }) // newest first
      .populate("studentId", "name _id register")
      .populate("Books.bookId", "ISBN");

    const today = moment().startOf("day");
    const allCheckoutDetails = [];

    for (const checkout of checkouts) {
      for (const bookEntry of checkout.Books) {
        if (bookEntry.bookId && bookEntry.bookId.ISBN) {
          allCheckoutDetails.push({
            checkoutId: checkout._id,
            studentId: checkout.studentId?._id,
            studentName: checkout.studentId?.name,
            studentRegister: checkout.studentId?.register,
            bookId: bookEntry.bookId._id,
            ISBN: bookEntry.bookId.ISBN,
            status: bookEntry.status,
            statusUpdatedAt: bookEntry.statusUpdatedAt,
            checkoutDate: checkout.checkoutDate,
            dueDate: checkout.duedate,
          });
        }
      }
    }

    // Filter logic
    const filteredDetails = allCheckoutDetails.filter((b) => {
      if (b.status === "pending") return true;
      if (b.status === "approved") {
        return moment(b.statusUpdatedAt).isSame(today, "day");
      }
      return false;
    });

    // Fetch book name for each entry using Open Library API
    const detailsWithBookName = await Promise.all(
      filteredDetails.map(async (entry) => {
        try {
          const response = await axios.get(
            `https://openlibrary.org/api/books?bibkeys=ISBN:${entry.ISBN}&format=json&jscmd=data`
          );
          const bookData = response.data[`ISBN:${entry.ISBN}`];
          const bookName = bookData?.title || "Unknown Title";
          return { ...entry, bookName };
        } catch (err) {
          console.error("Error fetching book data for ISBN:", entry.ISBN, err);
          return { ...entry, bookName: "Unknown Title" };
        }
      })
    );

    return res.status(200).json({
      success: true,
      total: detailsWithBookName.length,
      data: detailsWithBookName,
    });
  } catch (error) {
    console.error("❌ Error fetching all checkout details:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getStudentPendingCheckout = async (req, res) => {
  try {
    const { regnumber } = req.params; // or req.query

    if (!regnumber) {
      return res
        .status(400)
        .json({ success: false, message: "Register number is required" });
    }

    //  Find student by register number
    const student = await Student.findOne({ register: regnumber })
      .populate("course", "name")
      .populate("semester", "name");
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    //  Find all checkouts for the student
    const checkouts = await Checkout.find({ studentId: student._id });

    //  Count how many books are pending
    let pendingCount = 0;
    checkouts.forEach((checkout) => {
      checkout.Books.forEach((b) => {
        if (b.status === "pending") {
          pendingCount++;
        }
      });
    });

    return res.status(200).json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        register: student.register,
        course: student.course.name,
        semester: student.semester.name,
      },
      delay: pendingCount, // number of pending books
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const updateCheckoutStatus = async (req, res) => {
  try {
    const { checkoutId, bookId } = req.params;
    const { status } = req.body;

    if (!checkoutId || !bookId) {
      return res.status(400).json({
        success: false,
        message: "Checkout ID and Book ID are required",
      });
    }

    if (
      !status ||
      !["pending", "approved", "deleted", "returned"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required",
      });
    }

    // Update Checkout document
    const checkout = await Checkout.findById(checkoutId);
    if (!checkout) {
      return res
        .status(404)
        .json({ success: false, message: "Checkout not found" });
    }

    const bookEntry = checkout.Books.find(
      (b) => b.bookId.toString() === bookId
    );
    if (!bookEntry) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found in checkout" });
    }

    bookEntry.status = status;
    bookEntry.statusUpdatedAt = new Date();
    await checkout.save();

    // ✅ Update Transaction record
    const transaction = await Transaction.findOne({
      studentId: checkout.studentId,
      bookId: bookId,
    });

    if (transaction) {
      transaction.status = status;
      await transaction.save();
    }

    return res.status(200).json({
      success: true,
      message: "Book status updated successfully",
      checkout,
      transaction,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteCheckout = async (req, res) => {
  try {
    const { checkoutId, bookId } = req.params;

    if (!checkoutId) {
      return res
        .status(400)
        .json({ success: false, message: "Checkout ID is required" });
    }

    // Find checkout
    const checkout = await Checkout.findById(checkoutId);
    if (!checkout) {
      return res
        .status(404)
        .json({ success: false, message: "Checkout not found" });
    }

    // Case 1: No books at all → delete checkout directly
    if (!checkout.Books || checkout.Books.length === 0) {
      await Checkout.findByIdAndDelete(checkoutId);
      return res.status(200).json({
        success: true,
        message: "Empty checkout deleted successfully",
      });
    }

    // Case 2: If bookId is provided, remove that book
    if (bookId) {
      const bookIndex = checkout.Books.findIndex(
        (b) => b.bookId.toString() === bookId
      );

      if (bookIndex === -1) {
        return res
          .status(404)
          .json({ success: false, message: "Book not found in checkout" });
      }

      const removedBook = checkout.Books[bookIndex];

      // Remove book from checkout
      checkout.Books.splice(bookIndex, 1);

      // Update related transaction to "deleted"
      await Transaction.updateMany(
        {
          studentId: checkout.studentId,
          bookId: removedBook.bookId,
        },
        { $set: { status: "deleted" } }
      );

      if (checkout.Books.length === 0) {
        // If checkout is empty after removal → delete whole checkout
        await Checkout.findByIdAndDelete(checkoutId);
        return res.status(200).json({
          success: true,
          message: "Book removed, no books left, checkout deleted successfully",
        });
      } else {
        // Save updated checkout
        await checkout.save();
        return res.status(200).json({
          success: true,
          message: "Book removed from checkout successfully",
          checkout,
        });
      }
    }

    // Case 3: If no bookId given → delete whole checkout + mark all books deleted
    const bookIds = checkout.Books.map((b) => b.bookId);
    await Transaction.updateMany(
      { studentId: checkout.studentId, bookId: { $in: bookIds } },
      { $set: { status: "deleted" } }
    );
    await Checkout.findByIdAndDelete(checkoutId);

    return res.status(200).json({
      success: true,
      message: "Checkout deleted and transactions marked as deleted",
    });
  } catch (error) {
    console.error("❌ Error in deleteCheckout:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getStudentProfile = async (req, res) => {
  try {
    const { regnumber } = req.params;

    if (!regnumber) {
      return res
        .status(400)
        .json({ success: false, message: "Register number is required" });
    }

    //  Populate `course` and `semester`
    const student = await Student.findOne({ register: regnumber })
      .populate("course", "name")
      .populate("semester", "name");

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    // Define the base URL for constructing the image path
    const baseUrl = process.env.BASE_URL;

    //  Get transactions
    const transactions = await Transaction.find({
      studentId: student._id,
      status: { $ne: "deleted" },
    })
      .populate("bookId", "ISBN")
      .lean();

    //  Fetch titles for each ISBN individually
    const books = await Promise.all(
      transactions.map(async (t) => {
        let title = "Unknown";
        if (t.bookId?.ISBN) {
          try {
            const response = await axios.get(
              `https://openlibrary.org/api/books?bibkeys=ISBN:${t.bookId.ISBN}&format=json&jscmd=data`
            );
            const data = response.data[`ISBN:${t.bookId.ISBN}`];
            if (data?.title) title = data.title;
          } catch (err) {
            console.warn("Failed to fetch book title for ISBN:", t.bookId.ISBN);
          }
        }
        return {
          ISBN: t.bookId?.ISBN,
          title,
          status: t.status,
        };
      })
    );

    const totalBooks = books.length;
    const pendingBooks = books.filter((b) => b.status === "pending").length;

    return res.status(200).json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        register: student.register,
        course: student.course?.name || "N/A",
        semster: student.semester?.name || "N/A",
        // Added the image field here, matching the logic in getProfile
        image: student.image
          ? `${baseUrl}/uploads/students/${student.image}`
          : null,
      },
      stats: {
        totalBooks,
        pendingBooks,
      },
      books,
    });
  } catch (error) {
    console.error("❌ Error fetching student profile:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const confirmCheckoutWithOtp = async (req, res) => {
  try {
    const { studentId, otp } = req.body;

    if (!studentId || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "studentId and OTP are required" });
    }

    // Find OTP doc
    const otpDoc = await StudentOtp.findOne({ studentId });
    if (!otpDoc) {
      return res
        .status(404)
        .json({ success: false, message: "OTP not found or expired" });
    }

    // Verify OTP
    if (otpDoc.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (otpDoc.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // Calculate dates
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + 7);

    // Create checkout now (explicitly set checkoutDate)
    const newCheckout = new Checkout({
      studentId,
      Books: otpDoc.books,
      checkoutDate: today,
      duedate: dueDate,
      status: "pending",
    });

    await newCheckout.save();

    // Create transactions
    const transactionsToCreate = otpDoc.books.map((book) => ({
      studentId,
      bookId: book.bookId,
      status: "pending",
      checkoutDate: today,
      dueDate: dueDate,
    }));

    await Transaction.insertMany(transactionsToCreate);

    //  Update Library stock for each checked-out book
    for (const book of otpDoc.books) {
      const libraryBook = await Library.findById(book.bookId);
      if (libraryBook) {
        if (libraryBook.count > 0) {
          libraryBook.count -= 1;
          console.log(`count decreased for book ${libraryBook.ISBN}`);
          await libraryBook.save();
        } else {
          console.warn(`Book ${libraryBook.ISBN} is out of stock.`);
        }
      }
    }

    // Delete OTP doc after use
    await StudentOtp.deleteOne({ studentId });

    return res.status(200).json({
      success: true,
      message:
        "Checkout confirmed, transactions created, and library stock updated.",
      checkoutId: newCheckout._id,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
