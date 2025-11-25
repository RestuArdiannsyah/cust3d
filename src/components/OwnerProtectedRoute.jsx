import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Owner Protected Route - Hanya bisa diakses jika sudah login dan role = owner
 */
export const OwnerProtectedRoute = ({ children }) => {
  const { user, userData, loading } = useAuth();

  // Tampilkan loading saat mengecek auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Jika tidak login, redirect ke login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika role bukan owner, redirect ke profile user biasa
  if (userData?.role !== "owner") {
    return <Navigate to="/profile" replace />;
  }

  // Jika sudah login dan role = owner, tampilkan halaman
  return children;
};