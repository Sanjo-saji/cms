import { Navigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import type { ReactNode } from "react";
interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: string[]; // example: ["Principal", "Teacher"]
}

export function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
