import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  CreditCard,
  Shield,
  Truck,
  MapPin,
  CircleAlert,
  X,
  Upload,
  Image as ImageIcon,
  Camera,
  Trash2,
  Check,
  AlertCircle,
  Maximize2,
} from "lucide-react";
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

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useAuth();

  const fileInputRef = useRef(null);
  const [produk, setProduk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(5);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(null);
  const [showUploadTips, setShowUploadTips] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [hoveredImageIndex, setHoveredImageIndex] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [imageLimitReached, setImageLimitReached] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);
  
  const [selectedUkuran, setSelectedUkuran] = useState(null);
  
  const [shippingCosts, setShippingCosts] = useState([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [originId, setOriginId] = useState(null);
  const [destinationId, setDestinationId] = useState(null);
  const [shippingError, setShippingError] = useState("");
  const [tokoData, setTokoData] = useState(null);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin meninggalkan halaman?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const savedData = loadLocalStorageData(id);
    if (savedData) {
      setQuantity(savedData.quantity || 5);
      setUploadedImages(savedData.uploadedImages || []);
      setSelectedUkuran(savedData.selectedUkuran || null);
    }
  }, [id]);

  useEffect(() => {
    if (produk) {
      const dataToSave = {
        produkId: id,
        quantity,
        uploadedImages,
        selectedUkuran,
        lastUpdated: new Date().toISOString(),
      };
      saveLocalStorageData(id, dataToSave);
      setHasUnsavedChanges(true);
    }
  }, [id, quantity, uploadedImages, selectedUkuran, produk]);

  useEffect(() => {
    setUploadError(getUploadError(quantity, uploadedImages));
    setImageLimitReached(isImageLimitReached(quantity, uploadedImages));
  }, [quantity, uploadedImages]);

  useEffect(() => {
    if (uploadedImages.length > quantity) {
      const imagesToRemove = uploadedImages.length - quantity;
      const newImages = [...uploadedImages];

      for (let i = 0; i < imagesToRemove; i++) {
        newImages.pop();
      }

      setUploadedImages(newImages);

      if (previewIndex !== null && previewIndex >= newImages.length) {
        setPreviewIndex(null);
      }

      const dataToSave = {
        produkId: id,
        quantity,
        uploadedImages: newImages,
        selectedUkuran,
        lastUpdated: new Date().toISOString(),
      };
      saveLocalStorageData(id, dataToSave);
    }
  }, [quantity]);

  useEffect(() => {
    let isMounted = true;

    const loadProduk = async () => {
      if (location.state?.product) {
        if (isMounted) {
          const productData = location.state.product;
          setProduk({
            ...productData,
            hargaRupiah: formatHarga(productData.harga),
          });

          if (productData.ukuran && productData.ukuran.length > 0) {
            setSelectedUkuran(productData.ukuran[0]);
          }

          setLoading(false);
        }
      } else if (id) {
        try {
          if (isMounted) setLoading(true);

          const result = await getProdukById(id);

          if (isMounted) {
            if (result.success) {
              const produkData = {
                ...result.data,
                hargaRupiah: formatHarga(result.data.harga),
              };
              setProduk(produkData);

              if (produkData.ukuran && produkData.ukuran.length > 0) {
                setSelectedUkuran(produkData.ukuran[0]);
              }

              setError(null);
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
          if (isMounted) {
            setLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setError("ID produk tidak ditemukan");
          setLoading(false);
        }
      }
    };

    loadProduk();

    return () => {
      isMounted = false;
    };
  }, [id, location.state]);

  useEffect(() => {
    const loadTokoData = async () => {
      try {
        const tokoResult = await getTokoData();
        
        if (tokoResult.success && tokoResult.data.alamat) {
          setTokoData(tokoResult.data);
          
          const origin = tokoResult.data.alamat.desa_id || tokoResult.data.alamat.kota_id;
          if (origin) {
            setOriginId(origin);
          } else {
            setOriginId("65014");
          }
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
      if (!originId || !destinationId || quantity < 1) {
        return;
      }
      
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
          const errorMsg = `Tidak ada layanan pengiriman tersedia dari ${tokoData?.alamat?.kota || "Semarang"} ke ${userAddress?.kota || "tujuan Anda"}`;
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

  const handleQuantityChange = (type) => {
    if (type === "increment") {
      setQuantity((prev) => prev + 1);
    } else if (type === "decrement" && quantity > 5) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleSelectUkuran = (ukuran) => {
    setSelectedUkuran(ukuran);
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);

    if (files.length === 0) return;

    if (imageLimitReached) {
      alert(
        `Tidak dapat menambah gambar. Jumlah gambar sudah mencapai batas maksimal (${quantity} gambar).`
      );
      event.target.value = null;
      return;
    }

    const validationErrors = validateUploadedFiles(
      files,
      uploadedImages,
      quantity
    );
    if (validationErrors.length > 0) {
      alert(validationErrors.join("\n"));
      event.target.value = null;
      return;
    }

    setUploading(true);

    try {
      const newImages = await processUploadedImages(files);
      setUploadedImages((prev) => [...prev, ...newImages]);
      event.target.value = null;
    } catch (error) {
      alert("Terjadi kesalahan saat mengupload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (imageId) => {
    setUploadedImages((prev) => {
      const newImages = prev.filter((img) => img.id !== imageId);

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
    setPreviewIndex((prev) =>
      prev > 0 ? prev - 1 : uploadedImages.length - 1
    );
  };

  const handleNextImage = () => {
    setPreviewIndex((prev) =>
      prev < uploadedImages.length - 1 ? prev + 1 : 0
    );
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

  const handleSelectCourier = (courierData) => {
    setSelectedCourier(courierData);
  };

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
    if (!selectedCourier) return 0;
    return selectedCourier.cost || 0;
  };

  const getUserAddress = () => {
    if (!userData || !userData.alamat || !Array.isArray(userData.alamat)) {
      return null;
    }
    
    const mainAddress = userData.alamat.find((addr) => addr.utama === true);
    if (!mainAddress && userData.alamat.length > 0) {
      return userData.alamat[0];
    }
    
    return mainAddress;
  };

  const handleCheckout = (e) => {
    e.preventDefault();

    if (produk.ukuran && produk.ukuran.length > 0 && !selectedUkuran) {
      alert("Harap pilih ukuran produk terlebih dahulu.");
      return;
    }

    const userAddress = getUserAddress();
    if (!userAddress) {
      alert(
        "Anda belum memiliki alamat pengiriman utama. Harap tambahkan alamat terlebih dahulu."
      );
      return;
    }

    if (uploadedImages.length === 0) {
      alert(
        "Anda harus mengupload minimal 1 gambar referensi sebelum checkout."
      );
      return;
    }

    if (!selectedCourier) {
      alert("Harap pilih kurir pengiriman terlebih dahulu.");
      return;
    }

    const hargaSatuan = getHargaProduk();
    const subtotal = hargaSatuan * quantity;
    const shippingCost = getSelectedShippingCost();
    const total = calculateTotal(subtotal, shippingCost);
    const productDistribution = calculateProductDistribution(
      quantity,
      uploadedImages
    );

    const orderData = {
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
      customer: {
        uid: userData.uid,
        nama: userData.nama,
        nomorHP: userData.nomorHP,
        email: userData.email,
        alamat: userAddress,
      },
      uploadedImages: uploadedImages.map((img) => ({
        name: img.name,
        size: img.size,
        type: img.type,
        base64: img.base64,
        uploadedAt: img.uploadedAt,
      })),
      productDistribution,
      tanggal: new Date().toISOString(),
      orderId: `ORD-${Date.now()}`,
      status: "pending",
    };

    setHasUnsavedChanges(false);
    clearLocalStorageData(id);

    alert(
      `✅ Checkout berhasil!\n\n📦 Order ID: ${orderData.orderId}\n📏 Ukuran: ${
        selectedUkuran?.nama || "Standar"
      }\n🚚 Kurir: ${selectedCourier.name}\n💰 Total: ${formatHarga(
        orderData.total
      )}\n\nPesanan akan diproses dalam 1x24 jam.`
    );

    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Memuat produk...</p>
          <button
            onClick={triggerExitModal}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition cursor-pointer"
          >
            Kembali ke Toko
          </button>
        </div>
      </div>
    );
  }

  if (error || !produk) {
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
              onClick={triggerExitModal}
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
  }

  const userAddress = getUserAddress();
  const productDistribution = calculateProductDistribution(
    quantity,
    uploadedImages
  );
  const hargaSatuan = getHargaProduk();
  const subtotal = hargaSatuan * quantity;
  const shippingCost = getSelectedShippingCost();
  const total = calculateTotal(subtotal, shippingCost);

  const memilikiUkuran =
    produk.ukuran && Array.isArray(produk.ukuran) && produk.ukuran.length > 0;

  return (
    <div className="min-h-screen">
      <div className="xl:px-52 lg:px-20 md:px-12 px-6 py-10">
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

          {userData && userAddress ? (
            <div className="mt-6 pb-2 border-b-2 border-dashed border-white/10">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 mt-1" />
                <div className="grow">
                  <h3 className="font-bold text-xl mb-2 flex items-center gap-4">
                    <span className="font-medium">
                      {userData.nama || "-"}
                    </span>
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
                    Anda belum memiliki alamat pengiriman utama. Harap
                    tambahkan alamat terlebih dahulu.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
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

            <div className="border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-2xl flex items-center gap-3">
                    <Camera className="w-6 h-6 lg:block hidden" />
                    Upload Foto Referensi
                    <span className="text-red-400 text-sm font-normal -ml-2">
                      *
                    </span>
                  </h2>
                  <p className="text-white/60 text-sm mt-1">
                    Upload foto untuk dijadikan desain aksesoris
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowUploadTips(!showUploadTips)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm flex items-center gap-2 transition cursor-pointer"
                  >
                    <span>Tips Upload</span>
                  </button>

                  {uploadedImages.length > 0 && (
                    <button
                      onClick={handleRemoveAllImages}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg flex items-center gap-2 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Hapus Semua</span>
                    </button>
                  )}
                </div>
              </div>

              {uploadedImages.length > 0 && (
                <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <ImageIcon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          Distribusi Produk per Gambar
                        </h4>
                        <p className="text-sm text-white/60">
                          {quantity} produk akan didistribusikan ke{" "}
                          {uploadedImages.length} gambar
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-white/60">
                      Total: {uploadedImages.length}/{quantity} gambar
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {uploadedImages.map((img, index) => {
                      const dist = productDistribution.find(
                        (d) => d.imageIndex === index
                      );
                      return (
                        <div
                          key={img.id}
                          className="relative group"
                          onMouseEnter={() => setHoveredImageIndex(index)}
                          onMouseLeave={() => setHoveredImageIndex(null)}
                        >
                          <div className="relative rounded-lg overflow-hidden bg-white/5 aspect-square">
                            <img
                              src={img.base64 || img.preview}
                              alt={`Referensi ${index + 1}`}
                              className="w-full h-full object-cover"
                            />

                            <div
                              className={`absolute inset-0 bg-black/50 flex items-center justify-center gap-2 transition-opacity ${
                                hoveredImageIndex === index
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            >
                              <button
                                onClick={() => handleImageClick(index)}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition cursor-pointer"
                                title="Lihat detail"
                              >
                                <Maximize2 className="w-5 h-5 text-white" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveImage(img.id);
                                }}
                                className="p-2 bg-red-500/80 hover:bg-red-600 rounded-lg backdrop-blur-sm transition cursor-pointer"
                                title="Hapus gambar"
                              >
                                <Trash2 className="w-5 h-5 text-white" />
                              </button>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black to-transparent p-2">
                              <div className="text-center">
                                <div className="text-xs font-medium text-white">
                                  {dist && dist.count > 0
                                    ? `${dist.count} produk`
                                    : "Tidak ada produk"}
                                </div>
                                {dist && dist.count > 0 && (
                                  <div className="text-xs text-white/70">
                                    Produk {dist.start}-{dist.end}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {imageLimitReached ? (
                <div className="mb-4 p-4 border border-green-500/20 bg-green-500/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-green-400">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-300">
                        Upload Selesai!
                      </h4>
                      <p className="text-sm text-green-400/80">
                        Jumlah gambar sudah mencapai batas maksimal ({quantity}{" "}
                        gambar).
                      </p>
                    </div>
                  </div>
                </div>
              ) : uploadError && uploadedImages.length === 0 ? (
                <div className="mb-4 p-4 border border-yellow-500/20 bg-yellow-500/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-yellow-400">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-300">
                        Info Penting
                      </h4>
                      <p className="text-sm text-yellow-400/80">
                        {uploadError}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {!imageLimitReached && (
                <div className="mb-6">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploading || imageLimitReached}
                  />

                  <div
                    onClick={() => {
                      if (!uploading && !imageLimitReached) {
                        fileInputRef.current.click();
                      }
                    }}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                      ${
                        uploading || imageLimitReached
                          ? "border-white/10 bg-white/5 cursor-not-allowed"
                          : "border-white/20 hover:border-blue-500 hover:bg-blue-500/5"
                      }
                    `}
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <p className="text-white/70">Mengupload gambar...</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-white/60" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">
                          Klik atau Drag & Drop Gambar
                        </h3>
                        <p className="text-white/60 mb-4">
                          Upload {uploadedImages.length}/{quantity} gambar (
                          {formatFileSize(5 * 1024 * 1024)} per gambar)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {showUploadTips && (
                <div className="mb-6 p-6 bg-white/5 border border-white/10 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-lg flex items-center gap-2">
                      <span>📸</span> Tips Foto Terbaik untuk Desain
                    </h4>
                    <button
                      onClick={() => setShowUploadTips(false)}
                      className="text-white/60 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <ul className="space-y-3 text-sm text-white/70">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      <span>
                        <strong>WAJIB:</strong> Upload minimal 1 gambar
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      <span>
                        <strong>MAKSIMAL:</strong> Upload maksimal {quantity}{" "}
                        gambar (satu gambar per produk)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      <span>
                        Produk akan didistribusikan otomatis ke semua gambar
                        yang diupload
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      <span>
                        Contoh: 5 produk dengan 2 gambar = 2-3 produk per gambar
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      <span>
                        Gunakan pencahayaan yang baik untuk hasil desain optimal
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      <span>
                        Format: JPG, PNG, GIF (maksimal 5MB per gambar)
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

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
          </div>

          <div className="space-y-8">
            <div className="border border-white/10 rounded-2xl p-6 sticky top-8">
              <h2 className="font-bold text-2xl mb-6 flex items-center gap-3">
                <CreditCard className="w-6 h-6 lg:block hidden" />
                Ringkasan Belanja
              </h2>

              <div className="space-y-4 mb-6">
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

                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total Pembayaran</span>
                    <span>{formatHarga(total)}</span>
                  </div>
                </div>
              </div>

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

              <button
                onClick={handleCheckout}
                disabled={
                  uploadedImages.length === 0 ||
                  (memilikiUkuran && !selectedUkuran) ||
                  !selectedCourier
                }
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all
                  ${
                    uploadedImages.length === 0 ||
                    (memilikiUkuran && !selectedUkuran) ||
                    !selectedCourier
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
                  : "Buat Pesanan"}
              </button>

              <div className="text-sm text-white/50 space-y-2 mt-6 pt-6 border-t border-white/10">
                <p>Dengan menyelesaikan pembelian, Anda menyetujui:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Syarat dan Ketentuan</li>
                  <li>Kebijakan Privasi</li>
                  <li>Gambar akan digunakan untuk proses desain</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewIndex !== null && uploadedImages[previewIndex] && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setPreviewIndex(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {uploadedImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition cursor-pointer"
                >
                  ←
                </button>

                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition cursor-pointer"
                >
                  →
                </button>
              </>
            )}

            <img
              src={
                uploadedImages[previewIndex].base64 ||
                uploadedImages[previewIndex].preview
              }
              alt={`Preview ${previewIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg mx-auto"
            />

            <div className="absolute bottom-4 left-0 right-0 text-center text-white">
              <div className="inline-flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full mx-auto">
                <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                  Gambar {previewIndex + 1} dari {uploadedImages.length}
                </span>
                {productDistribution[previewIndex] &&
                  productDistribution[previewIndex].count > 0 && (
                    <span className="text-sm">
                      {productDistribution[previewIndex].count} produk
                      <span className="mx-2">•</span>
                      Produk {productDistribution[previewIndex].start}-
                      {productDistribution[previewIndex].end}
                    </span>
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showExitModal && (
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
                  onClick={handleCancelExit}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-medium transition-all duration-200 border border-white/10 cursor-pointer"
                >
                  Lanjutkan
                </button>

                <button
                  onClick={handleConfirmExit}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  Tinggalkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;