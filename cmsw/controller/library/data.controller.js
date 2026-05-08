import Library from "../../model/library/library.model.js";
import Transaction from "../../model/library/transation.model.js";
import Teacher from "../../model/teachers/teachers.model.js";
import axios from "axios";

export const getAllLibraryBooks = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const books = await Library.find();
    const results = [];

    for (const book of books) {
      const isbn = book.ISBN;

      // First API call
      const response = await axios.get(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
      );

      const data = response.data[`ISBN:${isbn}`];

      let description = "No description available";

      if (data && data.key) {
        try {
          // Second API call for description
          const workRes = await axios.get(
            `https://openlibrary.org${data.key}.json`
          );
          if (workRes.data.description) {
            if (typeof workRes.data.description === "string") {
              description = workRes.data.description;
            } else if (workRes.data.description.value) {
              description = workRes.data.description.value;
            }
          }
        } catch (descErr) {
          console.error(`Failed to get description for ISBN ${isbn}`);
        }
      }

      if (data) {
        results.push({
          isbn,
          count: book.count,
          title: data.title || "Unknown",
          authors: data.authors ? data.authors.map((a) => a.name) : ["Unknown"],
          publish_date: data.publish_date || "Unknown",
          cover: data.cover ? data.cover.medium : null,
          description,
        });
      } else {
        results.push({
          isbn,
          count: book.count,
          title: "Not found in Open Library",
          authors: [],
          publish_date: "",
          cover: null,
          description: "No description available",
        });
      }
    }

    return res.status(200).json({ success: true, books: results });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const searchBookByIsbn = async (req, res) => {
  try {
    const teacherId = req.user.id;
    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const { isbn } = req.query;
    if (!isbn) {
      return res
        .status(400)
        .json({ success: false, message: "ISBN is required" });
    }

    const response = await axios.get(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
    );

    const data = response.data[`ISBN:${isbn}`];
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Book not found in Open Library",
      });
    }

    const title = data.title || "Unknown";
    const authors = data.authors
      ? data.authors.map((a) => a.name)
      : ["Unknown"];
    const cover = data.cover ? data.cover.medium : null;
    const description = data.notes || "No description available";

    return res.status(200).json({
      success: true,
      book: {
        isbn,
        title,
        authors,
        cover,
        description,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const addLibraryBook = async (req, res) => {
  try {
    const teacherId = req.user.id;
    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const { ISBN, count } = req.body;
    if (!ISBN || !count) {
      return res
        .status(400)
        .json({ success: false, message: "ISBN and count are required" });
    }

    // Check if book already exists in DB
    const existing = await Library.findOne({ ISBN });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Book with this ISBN already exists",
      });
    }

    // Check ISBN in Open Library
    const response = await axios.get(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${ISBN}&format=json&jscmd=data`
    );

    const data = response.data[`ISBN:${ISBN}`];
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "ISBN not valid or book not found in Open Library",
      });
    }

    // Extract book details
    const title = data.title || "Unknown";
    const authors = data.authors
      ? data.authors.map((a) => a.name)
      : ["Unknown"];
    const cover = data.cover ? data.cover.medium : null;

    // Save to your library collection
    const newBook = new Library({
      ISBN,
      count,
    });
    await newBook.save();

    // Respond with book info
    return res.status(201).json({
      success: true,
      message: "Book added successfully",
      book: {
        ISBN,
        count,
        title,
        authors,
        cover,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const updateLibraryBook = async (req, res) => {
  try {
    const teacherId = req.user.id;
    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const { count } = req.body;

    if (count === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Count is required" });
    }

    const { isbn } = req.query;
    if (!isbn) {
      return res
        .status(400)
        .json({ success: false, message: "ISBN is required" });
    }

    const book = await Library.findOne({ ISBN: isbn });
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }

    // Update count only
    book.count = count;
    await book.save();

    return res.status(200).json({
      success: true,
      message: "Book count updated successfully",
      book,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const deleteLibraryBook = async (req, res) => {
  try {
    const teacherId = req.user.id;
    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Get ISBN from request params
    const { isbn } = req.params;

    if (!isbn) {
      return res.status(400).json({
        success: false,
        message: "ISBN is required",
      });
    }
    // Delete book by ISBN instead of _id
    const book = await Library.findOneAndDelete({ ISBN: isbn });
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getAllTransactionDetails = async (req, res) => {
  try {
    const teacherId = req.user.id;
    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    // Find all transactions and populate student & book
    const transactions = await Transaction.find({})
      .sort({ checkoutDate: -1 })
      .populate("studentId", "name")
      .populate("bookId", "ISBN");

    const allTransactionDetails = [];

    for (const transaction of transactions) {
      const student = transaction.studentId;
      const book = transaction.bookId;

      let bookTitle = "Unknown Title";

      if (book && book.ISBN) {
        try {
          // Fetch title from Open Library API
          const response = await axios.get(
            `https://openlibrary.org/api/books`,
            {
              params: {
                bibkeys: `ISBN:${book.ISBN}`,
                format: "json",
                jscmd: "data",
              },
            }
          );

          const bookData = response.data[`ISBN:${book.ISBN}`];
          if (bookData && bookData.title) {
            bookTitle = bookData.title;
          } else {
            bookTitle = `Title not found for ISBN ${book.ISBN}`;
          }
        } catch (apiError) {
          console.error(
            `❌ Error fetching Open Library data for ISBN ${book.ISBN}:`,
            apiError.message
          );
          bookTitle = `Failed to fetch title for ISBN ${book.ISBN}`;
        }
      }

      allTransactionDetails.push({
        transactionId: transaction._id,
        studentId: student?._id,
        studentName: student?.name || "No Name",
        ISBN: book?.ISBN || "N/A",
        bookTitle,
        status: transaction.status,
        checkoutDate: transaction.checkoutDate,
        dueDate: transaction.dueDate,
      });
    }

    return res.status(200).json({
      success: true,
      total: allTransactionDetails.length,
      data: allTransactionDetails,
    });
  } catch (error) {
    console.error("❌ Error fetching all transaction details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getTeacherProfile = async (req, res) => {
  try {
    const teacherId = req.user.id;
    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" });
    }

    const teacher = await Teacher.findById(teacherId)
      .populate("department", "name")
      .populate("classInCharge", "name");

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const baseUrl = process.env.BASE_URL;

    return res.status(200).json({
      message: "Teacher profile fetched successfully",
      profile: {
        name: teacher.name,
        employeeId: teacher.employee_id,
        role: teacher.role,
        department: teacher.department ? teacher.department.name : null,
        departmentHead: teacher.departmentHead,
        phone: teacher.phone,
        image: teacher.image
          ? `${baseUrl}/uploads/teachers/${teacher.image}`
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
