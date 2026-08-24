import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Removing any global padding or background here so the Login page 
  // can completely control the full-screen cinematic experience.
  return <Outlet />;
}
