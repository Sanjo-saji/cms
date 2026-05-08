import { type JSX } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Home from "@/pages/home";
import Login from "@/pages/login";
import AppSidebar from "./components/global/app-sidebar";
import Transaction from "./pages/transaction";
import BookStore from "./pages/book-store";
import Navbar from "./components/global/navbar";
import BookCheckouts from "./pages/book-checkouts";
import { BookProvider } from "./context/BookContext";
import { SearchProvider } from "./context/SearchContext";

// Auth checker
const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Redirect login to home if already authenticated
const PublicOnlyRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  const location = useLocation();
  const hideSidebarRoutes = ["/login"];
  const shouldShowSidebar = !hideSidebarRoutes.includes(location.pathname);

  return (
    <BookProvider>
      <SearchProvider>
        <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-bg)] text-white">
          {shouldShowSidebar && <AppSidebar />}

          <div className="flex-1 flex flex-col overflow-hidden">
            {shouldShowSidebar && <Navbar />}

            <div className="flex-1 overflow-y-auto">
              <Routes>
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <Login />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/"
                  element={
                    <RequireAuth>
                      <Home />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/transaction"
                  element={
                    <RequireAuth>
                      <Transaction />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/book-store"
                  element={
                    <RequireAuth>
                      <BookStore />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/book-checkouts"
                  element={
                    <RequireAuth>
                      <BookCheckouts />
                    </RequireAuth>
                  }
                />
              </Routes>
            </div>
          </div>
        </div>
      </SearchProvider>
    </BookProvider>
  );
};

export default App;
