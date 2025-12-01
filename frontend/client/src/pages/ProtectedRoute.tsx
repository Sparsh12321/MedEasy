import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children, allowed }) {
  const role = localStorage.getItem("role");

  if (!role) return <Navigate to="/login" replace />;

  if (allowed && !allowed.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
