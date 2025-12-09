import React from "react";

const LoadingState = ({ onBack }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/70">Memuat produk...</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition cursor-pointer"
        >
          Kembali ke Toko
        </button>
      </div>
    </div>
  );
};

export default LoadingState;