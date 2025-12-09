import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MapPin, CircleAlert } from "lucide-react";

import { getProdukById } from "../services/produk/ProdukServices";
import { useAuth } from "../hooks/useAuth";
import { getTokoData } from "../services/TokoOwnerServices";
import {
  formatHarga,
  formatFileSize,
  calculateProductDistribution,
  calculateSubtotal,
  calculateTotal,
  getUploadError,
  loadLocalStorageData,
  saveLocalStorageData,
  clearLocalStorageData,
  validateUploadedFiles,
  processUploadedImages,
  isImageLimitReached,
  getAllShippingCosts,
  getCourierName,
} from "../services/checkout/checkoutHelpers";

import DetailProduk from "../components/checkout/DetailProduk";
import UploadFoto from "../components/checkout/UploadFoto";
import Pengiriman from "../components/checkout/Pengiriman";
import Payment from "../components/checkout/Payment";
import RingkasanBelanja from "../components/checkout/RingkasanBelanja";
import ImagePreviewModal from "../components/checkout/ImagePreviewModal";
import ExitConfirmationModal from "../components/checkout/ExitConfirmationModal";
import LoadingState from "../components/checkout/LoadingState";
import ErrorState from "../components/checkout/ErrorState";

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useAuth();

  // Refs
  const fileInputRef = useRef(null);

  // State utama
  const [produk, setProduk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State produk
  const [quantity, setQuantity] = useState(5);
  const [selectedUkuran, setSelectedUkuran] = useState(null);
  
  // State gambar
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [hoveredImageIndex, setHoveredImageIndex] = useState(null);
  const [showUploadTips, setShowUploadTips] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [imageLimitReached, setImageLimitReached] = useState(false);
  
  // State pengiriman
  const [shippingCosts, setShippingCosts] = useState([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [originId, setOriginId] = useState(null);
  const [destinationId, setDestinationId] = useState(null);
  const [shippingError, setShippingError] = useState("");
  const [tokoData, setTokoData] = useState(null);
  
  // State pembayaran
  const [paymentProof, setPaymentProof] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState("DANA");
  
  // State modal dan perubahan
  const [showExitModal, setShowExitModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);

  // ==================== EFFECTS ====================
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin meninggalkan halaman?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const savedData = loadLocalStorageData(id);
    if (savedData) {
      setQuantity(savedData.quantity || 5);
      setUploadedImages(savedData.uploadedImages || []);
      setSelectedUkuran(savedData.selectedUkuran || null);
      setPaymentProof(savedData.paymentProof || null);
      setSelectedPayment(savedData.selectedPayment || "DANA");
    }
  }, [id]);

  useEffect(() => {
    if (produk) {
      const dataToSave = {
        produkId: id,
        quantity,
        uploadedImages,
        selectedUkuran,
        paymentProof,
        selectedPayment,
        lastUpdated: new Date().toISOString(),
      };
      saveLocalStorageData(id, dataToSave);
      setHasUnsavedChanges(true);
    }
  }, [id, quantity, uploadedImages, selectedUkuran, paymentProof, selectedPayment, produk]);

  useEffect(() => {
    setUploadError(getUploadError(quantity, uploadedImages));
    setImageLimitReached(isImageLimitReached(quantity, uploadedImages));
  }, [quantity, uploadedImages]);

  useEffect(() => {
    if (uploadedImages.length > quantity) {
      const imagesToRemove = uploadedImages.length - quantity;
      const newImages = [...uploadedImages.slice(0, -imagesToRemove)];

      setUploadedImages(newImages);

      if (previewIndex !== null && previewIndex >= newImages.length) {
        setPreviewIndex(null);
      }

      saveLocalStorageData(id, {
        produkId: id,
        quantity,
        uploadedImages: newImages,
        selectedUkuran,
        paymentProof,
        selectedPayment,
        lastUpdated: new Date().toISOString(),
      });
    }
  }, [quantity]);

  useEffect(() => {
    let isMounted = true;

    const loadProduk = async () => {
      if (location.state?.product) {
        if (isMounted) {
          handleProductData(location.state.product);
        }
      } else if (id) {
        try {
          if (isMounted) setLoading(true);
          const result = await getProdukById(id);

          if (isMounted) {
            if (result.success) {
              handleProductData(result.data);
            } else {
              setError(result.error || "Produk tidak ditemukan");
              setProduk(null);
            }
          }
        } catch (err) {
          if (isMounted) {
            setError("Terjadi kesalahan saat memuat produk");
            setProduk(null);
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        if (isMounted) {
          setError("ID produk tidak ditemukan");
          setLoading(false);
        }
      }
    };

    loadProduk();
    return () => { isMounted = false; };
  }, [id, location.state]);

  useEffect(() => {
    const loadTokoData = async () => {
      try {
        const tokoResult = await getTokoData();
        if (tokoResult.success && tokoResult.data.alamat) {
          setTokoData(tokoResult.data);
          const origin = tokoResult.data.alamat.desa_id || tokoResult.data.alamat.kota_id;
          setOriginId(origin || "65014");
        } else {
          setOriginId("65014");
        }
      } catch (error) {
        setOriginId("65014");
      }
    };

    loadTokoData();
  }, []);

  useEffect(() => {
    const userAddress = getUserAddress();
    if (userAddress) {
      const destination = userAddress.desa_id || userAddress.kota_id;
      if (destination) {
        setDestinationId(destination);
      }
    }
  }, [userData]);

  useEffect(() => {
    const loadShippingCosts = async () => {
      if (!originId || !destinationId || quantity < 1) return;

      setLoadingShipping(true);
      setShippingError("");

      try {
        const weight = 1000;
        const costs = await getAllShippingCosts(originId, destinationId, weight);

        if (costs.length > 0) {
          setShippingCosts(costs);
          setSelectedCourier(costs[0]);
        } else {
          const userAddress = getUserAddress();
          const errorMsg = `Tidak ada layanan pengiriman tersedia dari ${
            tokoData?.alamat?.kota || "Semarang"
          } ke ${userAddress?.kota || "tujuan Anda"}`;
          setShippingError(errorMsg);
        }
      } catch (error) {
        setShippingError("Gagal memuat biaya pengiriman. Silakan coba lagi.");
      } finally {
        setLoadingShipping(false);
      }
    };

    const timeoutId = setTimeout(() => {
      loadShippingCosts();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [originId, destinationId, quantity]);

  // ==================== HANDLERS ====================
  const handleProductData = (productData) => {
    const formattedProduct = {
      ...productData,
      hargaRupiah: formatHarga(productData.harga),
    };
    setProduk(formattedProduct);

    if (formattedProduct.ukuran?.length > 0) {
      setSelectedUkuran(formattedProduct.ukuran[0]);
    }
    setLoading(false);
  };

  const handleQuantityChange = (type) => {
    if (type === "increment") {
      setQuantity(prev => prev + 1);
    } else if (type === "decrement" && quantity > 5) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleSelectUkuran = (ukuran) => {
    setSelectedUkuran(ukuran);
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (imageLimitReached) {
      alert(`Tidak dapat menambah gambar. Jumlah gambar sudah mencapai batas maksimal (${quantity} gambar).`);
      event.target.value = null;
      return;
    }

    const validationErrors = validateUploadedFiles(files, uploadedImages, quantity);
    if (validationErrors.length > 0) {
      alert(validationErrors.join("\n"));
      event.target.value = null;
      return;
    }

    setUploading(true);
    try {
      const newImages = await processUploadedImages(files);
      setUploadedImages(prev => [...prev, ...newImages]);
      event.target.value = null;
    } catch (error) {
      alert("Terjadi kesalahan saat mengupload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (imageId) => {
    setUploadedImages(prev => {
      const newImages = prev.filter(img => img.id !== imageId);
      
      const savedData = loadLocalStorageData(id);
      if (savedData) {
        savedData.uploadedImages = newImages;
        saveLocalStorageData(id, savedData);
      }
      
      return newImages;
    });

    if (previewIndex !== null && uploadedImages.length <= 1) {
      setPreviewIndex(null);
    }
    setHoveredImageIndex(null);
  };

  const handleRemoveAllImages = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua gambar?")) {
      setUploadedImages([]);
      setPreviewIndex(null);
      setHoveredImageIndex(null);
    }
  };

  const handleImageClick = (index) => {
    setPreviewIndex(index);
  };

  const handlePrevImage = () => {
    setPreviewIndex(prev => prev > 0 ? prev - 1 : uploadedImages.length - 1);
  };

  const handleNextImage = () => {
    setPreviewIndex(prev => prev < uploadedImages.length - 1 ? prev + 1 : 0);
  };

  const handleSelectCourier = (courierData) => {
    setSelectedCourier(courierData);
  };

  const handlePaymentProofChange = (proofData) => {
    setPaymentProof(proofData);
  };

  const handleRemovePaymentProof = () => {
    setPaymentProof(null);
  };

  const handlePaymentMethodChange = (methodId) => {
    setSelectedPayment(methodId);
  };

  const triggerExitModal = () => {
    setShowExitModal(true);
  };

  const handleConfirmExit = () => {
    setHasUnsavedChanges(false);
    clearLocalStorageData(id);
    navigate("/toko");
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  const handleCheckout = (e) => {
    e.preventDefault();

    // Validasi
    if (produk.ukuran?.length > 0 && !selectedUkuran) {
      alert("Harap pilih ukuran produk terlebih dahulu.");
      return;
    }

    const userAddress = getUserAddress();
    if (!userAddress) {
      alert("Anda belum memiliki alamat pengiriman utama. Harap tambahkan alamat terlebih dahulu.");
      return;
    }

    if (uploadedImages.length === 0) {
      alert("Anda harus mengupload minimal 1 gambar referensi sebelum checkout.");
      return;
    }

    if (!selectedCourier) {
      alert("Harap pilih kurir pengiriman terlebih dahulu.");
      return;
    }

    if (!selectedPayment) {
      alert("Harap pilih metode pembayaran terlebih dahulu.");
      return;
    }

    // Validasi paymentProof
    if (!paymentProof) {
      alert("Harap upload bukti pembayaran terlebih dahulu.");
      return;
    }

    // Prepare order data
    const orderData = prepareOrderData(userAddress);

    setHasUnsavedChanges(false);
    clearLocalStorageData(id);

    showOrderConfirmation(orderData);
    navigate("/");
  };

  // ==================== HELPER FUNCTIONS ====================
  const getHargaProduk = () => {
    if (!produk) return 0;
    if (selectedUkuran && selectedUkuran.harga) {
      return selectedUkuran.harga;
    }
    return produk.harga || 0;
  };

  const formatHargaWithUkuran = (harga, ukuranNama) => {
    const hargaFormatted = formatHarga(harga);
    if (ukuranNama) {
      return `${hargaFormatted} (${ukuranNama})`;
    }
    return hargaFormatted;
  };

  const getSelectedShippingCost = () => {
    return selectedCourier?.cost || 0;
  };

  const getUserAddress = () => {
    if (!userData?.alamat || !Array.isArray(userData.alamat)) {
      return null;
    }

    const mainAddress = userData.alamat.find(addr => addr.utama === true);
    return mainAddress || userData.alamat[0];
  };

  const prepareOrderData = (userAddress) => {
    const hargaSatuan = getHargaProduk();
    const subtotal = hargaSatuan * quantity;
    const shippingCost = getSelectedShippingCost();
    const total = calculateTotal(subtotal, shippingCost);
    const productDistribution = calculateProductDistribution(quantity, uploadedImages);

    return {
      produk: {
        id: produk.id,
        namaProduk: produk.namaProduk,
        harga: hargaSatuan,
        deskripsi: produk.deskripsi,
        gambar: produk.gambarUtama || produk.gambar?.[0],
      },
      quantity,
      shippingMethod: selectedCourier,
      shippingCost,
      subtotal,
      total,
      ukuran: selectedUkuran,
      paymentMethod: selectedPayment,
      customer: {
        uid: userData.uid,
        nama: userData.nama,
        nomorHP: userData.nomorHP,
        email: userData.email,
        alamat: userAddress,
      },
      uploadedImages: uploadedImages.map(img => ({
        name: img.name,
        size: img.size,
        type: img.type,
        base64: img.base64,
        uploadedAt: img.uploadedAt,
      })),
      paymentProof: paymentProof ? {
        name: paymentProof.name,
        size: paymentProof.size,
        type: paymentProof.type,
        base64: paymentProof.base64 || paymentProof.preview,
        uploadedAt: paymentProof.uploadedAt,
      } : null,
      productDistribution,
      tanggal: new Date().toISOString(),
      orderId: `ORD-${Date.now()}`,
      status: "pending",
    };
  };

  const showOrderConfirmation = (orderData) => {
    alert(
      `✅ Checkout berhasil!\n\n📦 Order ID: ${orderData.orderId}\n📏 Ukuran: ${
        selectedUkuran?.nama || "Standar"
      }\n💳 Metode Pembayaran: ${selectedPayment}\n🚚 Kurir: ${selectedCourier.name}\n💰 Total: ${formatHarga(
        orderData.total
      )}\n\nPesanan akan diproses dalam 1x24 jam.`
    );
  };

  // ==================== RENDER LOGIC ====================
  if (loading) {
    return <LoadingState onBack={triggerExitModal} />;
  }

  if (error || !produk) {
    return <ErrorState error={error} onBack={triggerExitModal} />;
  }

  const userAddress = getUserAddress();
  const productDistribution = calculateProductDistribution(quantity, uploadedImages);
  const hargaSatuan = getHargaProduk();
  const subtotal = hargaSatuan * quantity;
  const shippingCost = getSelectedShippingCost();
  const total = calculateTotal(subtotal, shippingCost);
  const memilikiUkuran = produk.ukuran && Array.isArray(produk.ukuran) && produk.ukuran.length > 0;

  return (
    <div className="min-h-screen">
      <div className="xl:px-52 lg:px-20 md:px-12 px-6 py-10">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={triggerExitModal}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Toko
          </button>

          <h1 className="font-extrabold tracking-tighter text-4xl md:text-5xl mb-2">
            Pree Order 15 Hari
          </h1>

          {/* User Address Display */}
          {userData && userAddress ? (
            <div className="mt-6 pb-2 border-b-2 border-dashed border-white/10">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 mt-1" />
                <div className="grow">
                  <h3 className="font-bold text-xl mb-2 flex items-center gap-4">
                    <span className="font-medium">{userData.nama || "-"}</span>
                    <span className="font-normal">
                      ({userData.nomorHP || "-"})
                    </span>
                  </h3>
                  <div className="space-y-2">
                    <div className="mt-3">
                      <p className="text-white/80 text-sm mt-1">
                        {userAddress.alamatLengkap}
                      </p>
                      <p className="text-white/60 text-sm">
                        {userAddress.detail}
                      </p>
                      <p className="text-white/60 text-sm">
                        {userAddress.desa},{userAddress.kecamatan},{" "}
                        {userAddress.kota},{userAddress.provinsi} (
                        {userAddress.kodePos})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : userData ? (
            <div className="mt-6 p-6 border border-red-500/20 rounded-2xl bg-red-500/5">
              <div className="flex items-center gap-3">
                <div className="text-red-400">
                  <CircleAlert />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Perhatian</h3>
                  <p className="text-white/70 text-sm">
                    Anda belum memiliki alamat pengiriman utama. Harap tambahkan
                    alamat terlebih dahulu.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <DetailProduk
              produk={produk}
              quantity={quantity}
              selectedUkuran={selectedUkuran}
              memilikiUkuran={memilikiUkuran}
              handleSelectUkuran={handleSelectUkuran}
              handleQuantityChange={handleQuantityChange}
              hargaSatuan={hargaSatuan}
              formatHargaWithUkuran={() =>
                formatHargaWithUkuran(hargaSatuan, selectedUkuran?.nama)
              }
            />

            <UploadFoto
              uploadedImages={uploadedImages}
              uploading={uploading}
              imageLimitReached={imageLimitReached}
              uploadError={uploadError}
              hoveredImageIndex={hoveredImageIndex}
              productDistribution={productDistribution}
              showUploadTips={showUploadTips}
              fileInputRef={fileInputRef}
              setShowUploadTips={setShowUploadTips}
              setHoveredImageIndex={setHoveredImageIndex}
              handleImageUpload={handleImageUpload}
              handleRemoveAllImages={handleRemoveAllImages}
              handleImageClick={handleImageClick}
              handleRemoveImage={handleRemoveImage}
              quantity={quantity}
              formatFileSize={formatFileSize}
            />

            <Pengiriman
              loadingShipping={loadingShipping}
              shippingError={shippingError}
              shippingCosts={shippingCosts}
              selectedCourier={selectedCourier}
              tokoData={tokoData}
              userAddress={userAddress}
              handleSelectCourier={handleSelectCourier}
            />
          </div>

          <div className="space-y-8">
            <Payment 
              onPaymentProofChange={handlePaymentProofChange}
              onRemovePaymentProof={handleRemovePaymentProof}
              onPaymentMethodChange={handlePaymentMethodChange}
              paymentProof={paymentProof}
              selectedPayment={selectedPayment}
            />
            
            <RingkasanBelanja
              produk={produk}
              selectedUkuran={selectedUkuran}
              quantity={quantity}
              hargaSatuan={hargaSatuan}
              subtotal={subtotal}
              shippingCost={shippingCost}
              selectedCourier={selectedCourier}
              total={total}
              memilikiUkuran={memilikiUkuran}
              uploadedImages={uploadedImages}
              handleCheckout={handleCheckout}
              formatHargaWithUkuran={() =>
                formatHargaWithUkuran(hargaSatuan, selectedUkuran?.nama)
              }
              paymentProof={paymentProof}
              selectedPayment={selectedPayment}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {previewIndex !== null && uploadedImages[previewIndex] && (
        <ImagePreviewModal
          previewIndex={previewIndex}
          uploadedImages={uploadedImages}
          productDistribution={productDistribution}
          onClose={() => setPreviewIndex(null)}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
        />
      )}

      {showExitModal && (
        <ExitConfirmationModal
          onConfirm={handleConfirmExit}
          onCancel={handleCancelExit}
        />
      )}
    </div>
  );
};

export default Checkout;