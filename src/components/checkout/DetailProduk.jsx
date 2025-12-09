import React from "react";
import { Package } from "lucide-react";
import { formatHarga } from "../../services/checkout/checkoutHelpers";

const DetailProduk = ({
  produk,
  quantity,
  selectedUkuran,
  memilikiUkuran,
  handleSelectUkuran,
  handleQuantityChange,
  hargaSatuan,
  formatHargaWithUkuran
}) => {
  return (
    <div className="border border-white/10 rounded-2xl p-6">
      <h2 className="font-bold text-2xl mb-6 flex items-center gap-3">
        <Package className="w-6 h-6 lg:block hidden" />
        Detail Produk
      </h2>

      <div className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 shrink-0">
          {produk.gambarUtama || produk.gambar?.[0] ? (
            <img
              src={produk.gambarUtama || produk.gambar?.[0]}
              alt={produk.namaProduk}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30">
              <Package className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="grow">
          <h3 className="font-bold text-xl mb-2">
            {produk.namaProduk}
          </h3>

          <p className="font-semibold text-lg mb-4 ">
            {formatHargaWithUkuran(hargaSatuan)}
          </p>

          {produk.deskripsi && (
            <p className="text-white/70 text-sm mb-4 line-clamp-2">
              {produk.deskripsi}
            </p>
          )}

          {memilikiUkuran && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-white/70">Pilih Ukuran:</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {produk.ukuran.map((ukuran, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectUkuran(ukuran)}
                    className={`px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer
                      ${
                        selectedUkuran &&
                        selectedUkuran.nama === ukuran.nama
                          ? "border-blue-500 bg-blue-500/10 text-blue-300"
                          : "border-white/10 hover:border-white/20 hover:bg-white/5"
                      }`}
                  >
                    <div className="font-medium">{ukuran.nama}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mt-4">
            <span className="text-white/70">Jumlah (min. 5):</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleQuantityChange("decrement")}
                className={`w-8 h-8 flex items-center justify-center border rounded-lg transition
                  ${
                    quantity > 5
                      ? "border-white/20 hover:bg-white/10 cursor-pointer"
                      : "border-white/10 text-white/30 cursor-not-allowed"
                  }`}
                disabled={quantity <= 5}
              >
                -
              </button>
              <span className="font-bold text-lg min-w-8 text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange("increment")}
                className="w-8 h-8 flex items-center justify-center border border-white/20 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailProduk;