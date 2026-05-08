export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem("token");
  return !!token; // true if token exists
};

export const getUserRole = (): string | null => {
  return localStorage.getItem("role"); //  read role from localStorage
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/login";
};
