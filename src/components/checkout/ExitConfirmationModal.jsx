import React from "react";

const ExitConfirmationModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="bg-linear-to-br from-gray-900 to-gray-950 rounded-2xl max-w-md w-full border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-center mb-2">
            Tinggalkan Checkout?
          </h3>
          <p className="text-white/60 text-center text-sm">
            Anda akan keluar dari proses checkout
          </p>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-linear-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-medium transition-all duration-200 border border-white/10 cursor-pointer"
            >
              Lanjutkan
            </button>

            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              Tinggalkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmationModal;