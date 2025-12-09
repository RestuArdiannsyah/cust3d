import React from "react";
import { CircleAlert } from "lucide-react";

const ErrorState = ({ error, onBack }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-red-400 text-6xl mb-4">
          <CircleAlert />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {error || "Produk Tidak Ditemukan"}
        </h2>
        <p className="text-white/70 mb-6">
          {error
            ? `Error: ${error}`
            : "Produk tidak tersedia atau telah dihapus"}
        </p>
        <div className="space-y-3">
          <button
            onClick={onBack}
            className="w-full bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition"
          >
            Kembali ke Toko
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorState;