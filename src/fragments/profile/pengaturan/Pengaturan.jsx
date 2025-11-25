import React, { useState } from "react";
import { logout } from "../../../services/auth/AuthServices";
import { useNavigate, Link } from "react-router-dom";

const Pengaturan = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!window.confirm("Apakah Anda yakin ingin logout?")) return;

    setIsLoggingOut(true);
    const result = await logout();

    if (result.success) {
      navigate("/login");
    } else {
      alert("Gagal logout: " + result.error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* EDIT PROFILE */}
      <button
        className="w-full px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold 
                   hover:bg-purple-700 transition-all shadow shadow-purple-500/10"
      >
        Edit Profil
      </button>

      {/* UBAH PASSWORD */}
      <Link
        to="/reset-password"
        className="block w-full px-6 py-3 rounded-xl bg-white/10 text-white font-semibold 
                   border border-white/20 hover:bg-white/20 transition-all text-center 
                   shadow shadow-white/5"
      >
        Ubah Password
      </Link>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full px-6 py-3 rounded-xl bg-red-500/20 text-red-300 font-semibold 
                   hover:bg-red-500/30 transition-all shadow shadow-red-500/10
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoggingOut ? "Logging out..." : "Logout"}
      </button>

    </div>
  );
};

export default Pengaturan;
