import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // If no token, user is not logged in - send to /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, show the page
  return children;
}