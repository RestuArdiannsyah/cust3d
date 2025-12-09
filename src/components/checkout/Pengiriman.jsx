import React from "react";
import { Truck, AlertCircle } from "lucide-react";
import { formatHarga } from "../../services/checkout/checkoutHelpers";

const Pengiriman = ({
  loadingShipping,
  shippingError,
  shippingCosts,
  selectedCourier,
  tokoData,
  userAddress,
  handleSelectCourier
}) => {
  return (
    <div className="border border-white/10 rounded-2xl p-6">
      <h2 className="font-bold text-2xl mb-6 flex items-center gap-3">
        <Truck className="w-6 h-6 lg:block hidden" />
        Pilih Pengiriman
      </h2>

      {loadingShipping ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-white/70">Memuat biaya pengiriman...</p>
          <p className="text-white/50 text-sm mt-2">
            Origin: {tokoData?.alamat?.kota || "Semarang"} 
            → Destination: {userAddress?.kota || "Loading..."}
          </p>
        </div>
      ) : shippingError ? (
        <div className="mb-6 p-4 border border-red-500/20 bg-red-500/10 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="text-red-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-red-300">Error</h4>
              <p className="text-sm text-red-400/80">{shippingError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-sm"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      ) : shippingCosts.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-yellow-400 text-4xl mb-4">
            <AlertCircle />
          </div>
          <p className="text-white/70">Biaya pengiriman tidak tersedia</p>
          <p className="text-white/50 text-sm mt-2">
            Tidak ada kurir yang melayani rute ini
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
          >
            Refresh Halaman
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {shippingCosts.map((shipping, index) => (
            <div
              key={shipping.courier}
              onClick={() => handleSelectCourier(shipping)}
              className={`p-4 border rounded-xl cursor-pointer transition-all ${
                selectedCourier && selectedCourier.courier === shipping.courier
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/10 hover:bg-white/5 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      selectedCourier && selectedCourier.courier === shipping.courier
                        ? "bg-blue-500/20"
                        : "bg-white/5"
                    }`}
                  >
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{shipping.name}</h4>
                      {index === 0 && (
                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                          Termurah
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/60">
                      {shipping.service} • Estimasi {shipping.etd} hari
                    </p>
                  </div>
                </div>
                <div className="font-semibold">
                  {shipping.cost > 0 ? formatHarga(shipping.cost) : "Gratis"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <div className="text-sm text-white/60 space-y-2">
          <div className="flex justify-between">
            <span>Pengiriman dari:</span>
            <span className="text-white">
              {tokoData?.alamat?.kota || "Semarang"}, {tokoData?.alamat?.provinsi || "Jawa Tengah"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tujuan:</span>
            <span className="text-white">
              {userAddress ? `${userAddress.kota}, ${userAddress.provinsi}` : "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pengiriman;