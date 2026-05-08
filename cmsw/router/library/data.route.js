import express from "express";
import {
  addLibraryBook,
  deleteLibraryBook,
  getAllLibraryBooks,
  getAllTransactionDetails,
  getTeacherProfile,
  searchBookByIsbn,
  updateLibraryBook,
} from "../../controller/library/data.controller.js";
import { isAuthenticated } from "../../middileware/auth.middle.js";
import {
  confirmCheckoutWithOtp,
  createCheckout,
  deleteCheckout,
  getAllCheckoutDetails,
  getStudentPendingCheckout,
  getStudentProfile,
  updateCheckoutStatus,
} from "../../controller/library/checkout.controller.js";
const libraryDataRouter = express.Router();

libraryDataRouter.get(
  "/get-all-library-books",
  isAuthenticated,
  getAllLibraryBooks
);

libraryDataRouter.post("/add-library-book", isAuthenticated, addLibraryBook);
libraryDataRouter.put(
  "/update-library-book",
  isAuthenticated,
  updateLibraryBook
);

libraryDataRouter.delete(
  "/delete-library-book/:isbn",
  isAuthenticated,
  deleteLibraryBook
);

libraryDataRouter.post("/create-checkout", isAuthenticated, createCheckout);
libraryDataRouter.get(
  "/get-all-checkout-details",
  isAuthenticated,
  getAllCheckoutDetails
);
libraryDataRouter.put(
  "/update-checkout-status/:checkoutId/:bookId",
  isAuthenticated,
  updateCheckoutStatus
);
libraryDataRouter.delete(
  "/delete-checkout/:checkoutId/:bookId",
  isAuthenticated,
  deleteCheckout
);
libraryDataRouter.post("/confirm-otp", isAuthenticated, confirmCheckoutWithOtp);
libraryDataRouter.get(
  "/search-book-by-isbn",
  isAuthenticated,
  searchBookByIsbn
);
libraryDataRouter.get(
  "/get-student-pending-checkout/:regnumber",
  isAuthenticated,
  getStudentPendingCheckout
);
libraryDataRouter.get(
  "/get-all-transaction-details",
  isAuthenticated,
  getAllTransactionDetails
);

libraryDataRouter.get(
  "/get-student-profile/:regnumber",
  isAuthenticated,
  getStudentProfile
);

libraryDataRouter.get(
  "/get-teacher-profile",
  isAuthenticated,
  getTeacherProfile
);

export default libraryDataRouter;
