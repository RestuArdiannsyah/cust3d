import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Profile Router - Redirect ke layout yang sesuai berdasarkan role
 */
export const ProfileRouter = () => {
  const { userData, loading } = useAuth();

  // Tampilkan loading saat mengecek auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Redirect berdasarkan role
  if (userData?.role === "owner") {
    return <Navigate to="/owner/dashboard" replace />;
  }

  // Default ke profile user biasa
  return <Navigate to="/profile" replace />;
};