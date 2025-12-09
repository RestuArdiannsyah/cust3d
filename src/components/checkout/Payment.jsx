import React, { useState, useRef, useEffect } from "react";
import { CreditCard, Image as ImageIcon, X, Check } from "lucide-react";

const Payment = ({ 
  onPaymentProofChange, 
  onRemovePaymentProof, 
  onPaymentMethodChange, 
  paymentProof,
  selectedPayment 
}) => {
  const [uploadingProof, setUploadingProof] = useState(false);
  const [localSelectedPayment, setLocalSelectedPayment] = useState(selectedPayment || "DANA");
  const fileInputRef = useRef(null);

  // Sync dengan prop dari parent
  useEffect(() => {
    if (selectedPayment) {
      setLocalSelectedPayment(selectedPayment);
    }
  }, [selectedPayment]);

  const paymentMethods = [
    { id: "DANA", name: "DANA" },
    { id: "GOPAY", name: "GOPAY" },
    { id: "BRI_TRANSFER", name: "BRI TRANSFER" },
  ];

  const getPaymentDescription = (method) => {
    switch (method) {
      case "DANA":
        return "Bayar dengan aplikasi DANA Transfer";
      case "GOPAY":
        return "Bayar dengan aplikasi GoPay Transfer";
      case "BRI_TRANSFER":
        return "Bayar dengan BRI Transfer";
      default:
        return "";
    }
  };

  const getAccountInfo = (method) => {
    switch (method) {
      case "DANA":
        return "0858 0130 8928 - RESTU ARDIANSYAH";
      case "GOPAY":
        return "0858 0130 8928 - Restu Ardiansyah";
      case "BRI_TRANSFER":
        return "-";
      default:
        return "";
    }
  };

  const handlePaymentMethodSelect = (methodId) => {
    setLocalSelectedPayment(methodId);
    if (onPaymentMethodChange) {
      onPaymentMethodChange(methodId);
    }
  };

  const handlePaymentProofUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validasi file
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar (JPG, PNG, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    setUploadingProof(true);

    // Simulasi upload
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const paymentProofData = {
          id: Date.now(),
          name: file.name,
          size: file.size,
          type: file.type,
          preview: URL.createObjectURL(file),
          base64: e.target.result,
          uploadedAt: new Date().toISOString(),
        };
        
        // Kirim data ke parent component
        if (onPaymentProofChange) {
          onPaymentProofChange(paymentProofData);
        }
        
        setUploadingProof(false);
      };
      reader.readAsDataURL(file);
    }, 1000);
  };

  const handleRemoveProof = () => {
    if (paymentProof && paymentProof.preview) {
      URL.revokeObjectURL(paymentProof.preview);
    }
    
    // Beritahu parent component bahwa proof dihapus
    if (onRemovePaymentProof) {
      onRemovePaymentProof();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="border border-white/10 rounded-2xl p-6">
      <h2 className="font-bold text-2xl mb-6 flex items-center gap-3">
        <span className="text-lg"><CreditCard/></span>
        Pembayaran
      </h2>

      <div className="space-y-6">
        {/* Bagian Pilih Metode Pembayaran */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white/70 font-medium">
              Metode Pembayaran:
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => handlePaymentMethodSelect(method.id)}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 cursor-pointer
                  ${
                    localSelectedPayment === method.id
                      ? "border-blue-500 bg-blue-500/10 text-blue-300"
                      : "border-white/10 hover:border-white/20 hover:bg-white/5"
                  }`}
              >
                <div className="font-medium">{method.name}</div>
              </button>
            ))}
          </div>

          {/* Info metode pembayaran */}
          <div className="p-4 bg-white/5 rounded-lg border border-white/10 mb-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-blue-300 mb-1">
                  {localSelectedPayment}
                </h4>
                <p className="text-sm text-white/80">
                  {getPaymentDescription(localSelectedPayment)}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10">
                <div className="bg-black/30 p-3 rounded-lg">
                  <p className="text-white font-mono text-sm whitespace-pre-line">
                    {getAccountInfo(localSelectedPayment)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bagian Upload Bukti Pembayaran */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                Upload Bukti Pembayaran
                <span className="text-red-400 text-sm font-normal">*</span>
              </h3>
              <p className="text-white/60 text-sm mt-1">
                Wajib upload bukti screenshot pembayaran
              </p>
            </div>
          </div>

          {paymentProof ? (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Check className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-300">
                      Bukti Pembayaran Berhasil Di Upload
                    </h4>
                    {/* <p className="text-sm text-green-400/80">
                      {paymentProof.name} (
                      {(paymentProof.size / 1024 / 1024).toFixed(2)} MB)
                    </p> */}
                  </div>
                </div>
                <button
                  onClick={handleRemoveProof}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative rounded-lg overflow-hidden bg-white/5 aspect-video">
                <img
                  src={paymentProof.preview}
                  alt="Bukti Pembayaran"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePaymentProofUpload}
                accept="image/*"
                className="hidden"
                disabled={uploadingProof}
              />

              <div
                onClick={triggerFileInput}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                  ${
                    uploadingProof
                      ? "border-white/10 bg-white/5 cursor-not-allowed"
                      : "border-white/20 hover:border-blue-500 hover:bg-blue-500/5"
                  }
                `}
              >
                {uploadingProof ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <p className="text-white/70">
                      Mengupload bukti pembayaran...
                    </p>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-lg mb-2">
                      Klik untuk Upload Bukti Pembayaran
                    </h3>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Informasi penting */}
          {/* <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <span className="text-yellow-400"></span>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-300 mb-1">Penting!</h4>
                <ul className="text-sm text-yellow-400/80 space-y-1">
                  <li>• Upload bukti pembayaran untuk proses verifikasi</li>
                  <li>
                    • Pastikan nominal transfer sesuai dengan total pembayaran
                  </li>
                  <li>
                    • Pesanan akan diproses setelah pembayaran diverifikasi
                  </li>
                  <li>• Verifikasi membutuhkan waktu 1-3 jam kerja</li>
                  <li>• Transfer ke nomor rekening yang sesuai dengan metode pembayaran dipilih</li>
                </ul>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Payment;