import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import {
  ProtectedRoute,
  PublicRoute,
  UserProtectedRoute,
} from "./components/ProtectedRoute";
import { OwnerProtectedRoute } from "./components/OwnerProtectedRoute";
import { ProfileRouter } from "./components/ProfileRouter";
import Toko from "./pages/Toko";
import Profile from "./pages/owner/Profile";

// pages
const Layout = lazy(() => import("./layout/Layout"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ProfileLayout = lazy(() => import("./layout/ProfileLayout"));
const OwnerLayout = lazy(() => import("./layout/OwnerLayout"));

// Profile pages (User)
const Info = lazy(() => import("./fragments/profile/info/Info"));
const Pengaturan = lazy(() =>
  import("./fragments/profile/pengaturan/Pengaturan")
);
const Pesanan = lazy(() => import("./fragments/profile/pesanan/Pesanan"));

// Owner pages
const Dashboard = lazy(() => import("./pages/owner/Dashboard"));
const Produk = lazy(() => import("./pages/owner/Produk"));
const PesananOwner = lazy(() => import("./pages/owner/Pesanan"));
const Pelanggan = lazy(() => import("./pages/owner/Pelanggan"));
const Laporan = lazy(() => import("./pages/owner/Laporan"));
const PengaturanOwner = lazy(() => import("./pages/owner/Pengaturan"));
const TambahProduk = lazy(() => import("./pages/owner/produk/TambahProduk"));
const DetailProduk = lazy(() => import("./pages/owner/produk/DetailProduk"));

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
  // {
  //   path: "/toko",
  //   element: <Toko />,
  // },
  {
    path: "/reset-password",
    element: (
      <ProtectedRoute>
        <ForgotPassword />
      </ProtectedRoute>
    ),
  },

  {
    path: "/toko",
    element: <Toko />,
  },

  // checkout
  {
    path: "/checkout/:id",
    element: (
      <ProtectedRoute>
        <Checkout />
      </ProtectedRoute>
    ),
  },

  // Profile Router - Redirect otomatis berdasarkan role
  {
    path: "/profile-redirect",
    element: (
      <ProtectedRoute>
        <ProfileRouter />
      </ProtectedRoute>
    ),
  },

  // Profile Routes (User) - Hanya untuk role "user"
  {
    path: "/profile",
    element: (
      <UserProtectedRoute>
        <ProfileLayout />
      </UserProtectedRoute>
    ),
    children: [
      {
        index: true, // /profile
        element: <Info />,
      },
      {
        path: "pengaturan", // /profile/pengaturan
        element: <Pengaturan />,
      },
      {
        path: "pesanan", // /profile/pesanan
        element: <Pesanan />,
      },
    ],
  },

  // Owner Routes - Hanya untuk role "owner"
  {
    path: "/owner",
    element: (
      <OwnerProtectedRoute>
        <OwnerLayout />
      </OwnerProtectedRoute>
    ),
    children: [
      {
        path: "dashboard", // /owner/dashboard
        element: <Dashboard />,
      },
      {
        path: "produk", // /owner/produk
        element: <Produk />,
      },
      {
        path: "pesanan", // /owner/pesanan
        element: <PesananOwner />,
      },
      {
        path: "pelanggan", // /owner/pelanggan
        element: <Pelanggan />,
      },
      {
        path: "laporan", // /owner/laporan
        element: <Laporan />,
      },
      {
        path: "pengaturan", // /owner/pengaturan
        element: <PengaturanOwner />,
      },
      {
        path: "profile", // /owner/profile
        element: <Profile />,
      },
      // produk lainnya
      {
        path: "tambah-produk", // /owner/tambah-produk
        element: <TambahProduk />,
      },
      {
        path: "detail-produk/:id", // /owner/tambah-produk
        element: <DetailProduk />,
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
