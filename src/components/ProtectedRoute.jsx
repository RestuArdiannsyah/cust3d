import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Protected Route - Hanya bisa diakses jika sudah login
 */
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

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

  // Jika sudah login, tampilkan halaman
  return children;
};

/**
 * User Protected Route - Hanya bisa diakses jika sudah login dan role = user
 */
export const UserProtectedRoute = ({ children }) => {
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

  // Jika role = owner, redirect ke owner dashboard
  if (userData?.role === "owner") {
    return <Navigate to="/owner/dashboard" replace />;
  }

  // Jika sudah login dan role = user, tampilkan halaman
  return children;
};

/**
 * Public Route - Hanya bisa diakses jika belum login
 * Jika sudah login, redirect ke home
 */
export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Tampilkan loading saat mengecek auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Jika sudah login, redirect ke home
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Jika belum login, tampilkan halaman
  return children;
};