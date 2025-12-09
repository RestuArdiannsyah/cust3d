import React from "react";
import { ShoppingBag, Shield, CreditCard } from "lucide-react";
import { formatHarga } from "../../services/checkout/checkoutHelpers";

const RingkasanBelanja = ({
  produk,
  selectedUkuran,
  quantity,
  hargaSatuan,
  subtotal,
  shippingCost,
  selectedCourier,
  total,
  memilikiUkuran,
  uploadedImages,
  handleCheckout,
  formatHargaWithUkuran,
  paymentProof,
  selectedPayment
}) => {
  
  // Fungsi untuk mendapatkan nama metode pembayaran yang lebih user-friendly
  const getPaymentMethodName = (methodId) => {
    const paymentMethods = {
      "DANA": "DANA",
      "GOPAY": "GOPAY",
      "BRI_TRANSFER": "BRI Transfer"
    };
    return paymentMethods[methodId] || methodId;
  };

  // Fungsi untuk mendapatkan deskripsi metode pembayaran
  const getPaymentMethodDescription = (methodId) => {
    const descriptions = {
      "DANA": "Transfer via aplikasi DANA",
      "GOPAY": "Transfer via aplikasi GoPay",
      "BRI_TRANSFER": "Transfer via BRI"
    };
    return descriptions[methodId] || "Transfer";
  };

  return (
    <div className="border border-white/10 rounded-2xl p-6 sticky top-8">
      <h2 className="font-bold text-2xl mb-6 flex items-center gap-3">
        <ShoppingBag className="w-6 h-6 lg:block hidden" />
        Ringkasan Belanja
      </h2>

      <div className="space-y-4 mb-6">
        {/* Informasi Produk */}
        <div className="mb-4 p-3 bg-white/5 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-white/70">Produk:</span>
            <span>{produk.namaProduk}</span>
          </div>
          {selectedUkuran && (
            <div className="flex justify-between mb-2">
              <span className="text-white/70">Ukuran:</span>
              <span className="font-medium">{selectedUkuran.nama}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-white/70">Harga Satuan:</span>
            <span className="font-semibold">
              {formatHargaWithUkuran(hargaSatuan)}
            </span>
          </div>
        </div>

        {/* Informasi Pembayaran yang Dipilih */}
        {selectedPayment && (
          <div className="mb-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 font-medium">Metode Pembayaran:</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold text-white">
                  {getPaymentMethodName(selectedPayment)}
                </span>
                <p className="text-white/60 text-xs mt-0.5">
                  {getPaymentMethodDescription(selectedPayment)}
                </p>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                paymentProof 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-yellow-500/20 text-yellow-400"
              }`}>
                {paymentProof ? "Berhasil" : "Belum upload bukti"}
              </div>
            </div>
          </div>
        )}

        {/* Detail Biaya */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-white/70">
              Subtotal ({quantity} item)
            </span>
            <span>{formatHarga(subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-white/70">Biaya Pengiriman</span>
            <span className={shippingCost === 0 ? "text-green-400" : ""}>
              {shippingCost === 0 
                ? "Gratis" 
                : formatHarga(shippingCost)}
            </span>
          </div>

          {selectedCourier && (
            <div className="flex justify-between text-sm text-white/60">
              <span>Metode Pengiriman:</span>
              <span>{selectedCourier.name}</span>
            </div>
          )}

          {selectedCourier && selectedCourier.etd && (
            <div className="text-sm text-white/60 flex justify-between">
              <span>Estimasi pengiriman:</span>
              <span>{selectedCourier.etd} hari</span>
            </div>
          )}
        </div>

        {/* Total Pembayaran */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex justify-between text-xl font-bold">
            <span>Total Pembayaran</span>
            <span>{formatHarga(total)}</span>
          </div>
          
          {/* Informasi Pembayaran Tambahan */}
          {/* {selectedPayment && !paymentProof && (
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-sm text-center">
                ⚠️ Harap upload bukti pembayaran untuk melanjutkan
              </p>
            </div>
          )} */}
        </div>
      </div>

      {/* Informasi Keamanan */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-300 mb-1">
              Pembayaran Aman
            </h4>
            <p className="text-blue-400/80 text-sm">
              Data pembayaran Anda dilindungi dengan enkripsi SSL
              256-bit.
            </p>
          </div>
        </div>
      </div>

      {/* Tombol Checkout */}
      <button
        onClick={handleCheckout}
        disabled={
          uploadedImages.length === 0 ||
          (memilikiUkuran && !selectedUkuran) ||
          !selectedCourier ||
          !paymentProof ||
          !selectedPayment
        }
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all
          ${
            uploadedImages.length === 0 ||
            (memilikiUkuran && !selectedUkuran) ||
            !selectedCourier ||
            !paymentProof ||
            !selectedPayment
              ? "bg-white/10 text-white/60 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
          }`}
      >
        {uploadedImages.length === 0
          ? "Upload Gambar Terlebih Dahulu"
          : memilikiUkuran && !selectedUkuran
          ? "Pilih Ukuran Terlebih Dahulu"
          : !selectedCourier
          ? "Pilih Kurir Pengiriman"
          : !selectedPayment
          ? "Pilih Metode Pembayaran"
          : !paymentProof
          ? "Upload Bukti Pembayaran Terlebih Dahulu"
          : "Buat Pesanan"}
      </button>

      {/* Syarat dan Ketentuan */}
      <div className="text-sm text-white/50 space-y-2 mt-6 pt-6 border-t border-white/10">
        <p>Dengan menyelesaikan pembelian, Anda menyetujui:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Syarat dan Ketentuan</li>
          <li>Kebijakan Privasi</li>
          <li>Gambar akan digunakan untuk proses desain</li>
          <li>Pembayaran harus sesuai dengan metode yang dipilih</li>
        </ul>
      </div>
    </div>
  );
};

export default RingkasanBelanja;