import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";

// Lazy pages
const Layout = lazy(() => import("./layout/Layout"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ProfileLayout = lazy(() => import("./layout/ProfileLayout"));

// profile pages
const Info = lazy(() => import("./fragments/profile/info/Info"));
const Pengaturan = lazy(() =>
  import("./fragments/profile/pengaturan/Pengaturan")
);
const Pesanan = lazy(() => import("./fragments/profile/pesanan/Pesanan"));

const router = createBrowserRouter([
  // Public Routes - Hanya bisa diakses jika BELUM login
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <ProtectedRoute>
        <ForgotPassword />
      </ProtectedRoute>
    ),
  },

  // Profile Routes dengan Layout - Hanya bisa diakses jika SUDAH login
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfileLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true, // /profile
        element: <Info />,
      },
      {
        path: "pengaturan", // /profile/settings
        element: <Pengaturan />,
      },
      {
        path: "pesanan", // /profile/settings
        element: <Pesanan />,
      },
    ],
  },

  // Routes dengan layout
  {
    path: "/",
    element: <Layout />,
    children: [
      // Home - Bisa diakses siapa saja
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
]);

export default router;
