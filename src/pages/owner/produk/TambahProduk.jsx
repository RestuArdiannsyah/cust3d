import React, { useState, useEffect } from "react";
import { tambahProduk } from "../../../services/produk/ProdukServices";
import { Link } from "react-router-dom";

const TambahProduk = () => {
  const [previewImages, setPreviewImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [compressionProgress, setCompressionProgress] = useState(null);
  
  // State untuk ukuran
  const [ukuranList, setUkuranList] = useState([]);
  const [showTambahUkuran, setShowTambahUkuran] = useState(false);
  const [ukuranForm, setUkuranForm] = useState({
    nama: "",
    harga: "",
  });

  const [formData, setFormData] = useState({
    namaProduk: "",
    harga: "", // Harga default untuk produk tanpa ukuran
    deskripsi: "",
  });

  // Auto-save form data ke localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("tambahProdukDraft");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed.formData || formData);
        setUkuranList(parsed.ukuranList || []);
      } catch (e) {
        console.error("Error loading draft:", e);
      }
    }
  }, []);

  // Save form data saat ada perubahan
  useEffect(() => {
    const draftData = {
      formData,
      ukuranList
    };
    localStorage.setItem("tambahProdukDraft", JSON.stringify(draftData));
  }, [formData, ukuranList]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const totalImages = previewImages.length + files.length;
    if (totalImages > 5) {
      setMessage({
        type: "error",
        text: `Maksimal 5 gambar. Anda sudah memilih ${previewImages.length} gambar.`,
      });
      return;
    }

    for (let file of files) {
      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: `${file.name} bukan file gambar` });
        return;
      }
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
    setImageFiles((prev) => [...prev, ...files]);
    setMessage({ type: "", text: "" });
  };

  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fungsi untuk ukuran
  const handleUkuranChange = (e) => {
    const { name, value } = e.target;
    setUkuranForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const tambahUkuran = () => {
    if (!ukuranForm.nama.trim()) {
      setMessage({ type: "error", text: "Nama ukuran harus diisi" });
      return;
    }

    if (!ukuranForm.harga || ukuranForm.harga <= 0) {
      setMessage({ type: "error", text: "Harga ukuran harus valid" });
      return;
    }

    const newUkuran = {
      id: Date.now().toString(),
      nama: ukuranForm.nama.trim(),
      harga: parseInt(ukuranForm.harga),
    };

    setUkuranList((prev) => [...prev, newUkuran]);
    setUkuranForm({
      nama: "",
      harga: "",
    });
    setShowTambahUkuran(false);
    setMessage({ type: "success", text: "Ukuran berhasil ditambahkan" });
  };

  const hapusUkuran = (id) => {
    setUkuranList((prev) => prev.filter(ukuran => ukuran.id !== id));
  };

  const clearDraft = () => {
    localStorage.removeItem("tambahProdukDraft");
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });
    setCompressionProgress({
      current: 0,
      total: imageFiles.length,
      fileName: "",
    });

    try {
      // Validasi input
      if (!formData.namaProduk.trim()) {
        throw new Error("Nama produk harus diisi");
      }

      // Jika tidak ada ukuran, validasi harga default
      if (ukuranList.length === 0 && (!formData.harga || formData.harga <= 0)) {
        throw new Error("Harga produk harus valid");
      }

      if (!formData.deskripsi.trim()) {
        throw new Error("Deskripsi produk harus diisi");
      }

      if (imageFiles.length === 0) {
        throw new Error("Minimal 1 gambar produk harus diupload");
      }

      // Siapkan data untuk dikirim
      const productData = {
        ...formData,
        harga: ukuranList.length > 0 ? 0 : parseInt(formData.harga), // Harga default 0 jika ada ukuran
        ukuran: ukuranList.length > 0 ? ukuranList : null
      };

      // Callback untuk update progress
      const onProgress = (progress) => {
        setCompressionProgress(progress);
      };

      const result = await tambahProduk(productData, imageFiles, onProgress);

      setCompressionProgress(null);

      if (result.success) {
        setMessage({ type: "success", text: result.message });

        // Reset form
        setFormData({
          namaProduk: "",
          harga: "",
          deskripsi: "",
        });
        setPreviewImages([]);
        setImageFiles([]);
        setUkuranList([]);

        // Clear draft
        clearDraft();

        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({ type: "error", text: error.message });
      setCompressionProgress(null);
    } finally {
      setLoading(false);
    }
  };

  // Format harga untuk display
  const formatHarga = (harga) => {
    return `Rp ${parseInt(harga).toLocaleString("id-ID")}`;
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-3">
        <Link to="/owner/produk" className="hover:text-white transition">
          Kelola Produk
        </Link>
        <span>/</span>
        <span className="text-white">Tambah Produk</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Tambah Produk</h1>
        <p className="text-zinc-400">
          Isi data produk dengan lengkap di bawah ini
        </p>
        {(formData.namaProduk || formData.harga || formData.deskripsi || ukuranList.length > 0) && (
          <p className="text-xs text-green-400 mt-2">
            ✓ Draft tersimpan otomatis
          </p>
        )}
      </div>

      {message.text && (
        <div
          className={`mb-4 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {compressionProgress && (
        <div className="mb-4 p-4 rounded-lg border border-blue-500/20 bg-blue-500/10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <svg
                className="animate-spin h-5 w-5 text-blue-400 flex-shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <div className="flex-1">
                <p className="text-blue-400 text-sm font-medium">
                  Mengompresi gambar {compressionProgress.current}/
                  {compressionProgress.total}
                </p>
                {compressionProgress.fileName && (
                  <p className="text-blue-300 text-xs mt-1">
                    {compressionProgress.fileName}
                    {compressionProgress.originalSize &&
                      ` (${compressionProgress.originalSize}KB)`}
                  </p>
                )}
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(compressionProgress.current / compressionProgress.total) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm shadow-lg">
        <div className="space-y-6">
          {/* Bagian Foto Produk */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Foto Produk <span className="text-red-400">*</span>
              <span className="text-xs text-zinc-400 ml-2">
                ({imageFiles.length}/5 gambar)
              </span>
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={loading || imageFiles.length >= 5}
              className="
                w-full text-sm border border-white/10 
                rounded-lg file:bg-white/10 file:border-0 
                file:px-4 file:py-2 file:mr-4 file:text-white
                cursor-pointer bg-white/5 disabled:opacity-50
                disabled:cursor-not-allowed
              "
            />

            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-3">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="
                        w-full aspect-square object-cover rounded-lg 
                        border border-white/10 shadow-md
                      "
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={loading}
                      className="
                        absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 
                        text-white rounded-full w-6 h-6 flex items-center 
                        justify-center text-xs transition opacity-0 
                        group-hover:opacity-100 disabled:opacity-30
                      "
                    >
                      ✕
                    </button>
                    {index === 0 && (
                      <div
                        className="
                        absolute bottom-1 left-1 bg-blue-500 text-white 
                        text-xs px-2 py-0.5 rounded
                      "
                      >
                        Utama
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-zinc-500 mt-1">
              Format: JPG, PNG, GIF. Ukuran bebas, akan otomatis dikompresi.
              Gambar pertama akan menjadi gambar utama.
            </p>
          </div>

          {/* Nama Produk */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Nama Produk <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="namaProduk"
              value={formData.namaProduk}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Masukkan nama produk..."
              className="
                w-full bg-white/5 border border-white/10 rounded-lg p-3 
                text-sm text-white placeholder-zinc-500
                focus:border-white/20 focus:outline-none
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            />
          </div>

          {/* Sistem Ukuran */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-white">
                Ukuran & Harga
                <span className="text-xs text-zinc-400 ml-2">
                  ({ukuranList.length} ukuran ditambahkan)
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowTambahUkuran(true)}
                className="
                  text-sm bg-white/10 hover:bg-white/20 border border-white/10 
                  px-3 py-1.5 rounded-lg transition
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                disabled={loading}
              >
                + Tambah Ukuran
              </button>
            </div>

            {/* List Ukuran yang sudah ditambahkan */}
            {ukuranList.length > 0 ? (
              <div className="space-y-2">
                {ukuranList.map((ukuran) => (
                  <div key={ukuran.id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg">
                    <span className="font-medium text-white">{ukuran.nama}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-green-400">
                        {formatHarga(ukuran.harga)}
                      </span>
                      <button
                        type="button"
                        onClick={() => hapusUkuran(ukuran.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                        disabled={loading}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Harga Default (jika tidak ada ukuran)
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white">
                  Harga Produk (Rp) <span className="text-red-400">*</span>
                  <span className="text-xs text-zinc-400 ml-2">
                    (Harga default jika tidak ada ukuran)
                  </span>
                </label>
                <input
                  type="number"
                  name="harga"
                  value={formData.harga}
                  onChange={handleInputChange}
                  disabled={loading || ukuranList.length > 0}
                  placeholder="Contoh: 25000"
                  min="0"
                  className="
                    w-full bg-white/5 border border-white/10 rounded-lg p-3 
                    text-sm text-white placeholder-zinc-500
                    focus:border-white/20 focus:outline-none
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                />
              </div>
            )}

            <p className="text-xs text-zinc-500">
              {ukuranList.length > 0 
                ? "Produk ini memiliki beberapa ukuran dengan harga berbeda."
                : "Jika produk memiliki ukuran, klik 'Tambah Ukuran'. Jika tidak, isi harga default di atas."
              }
            </p>
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Deskripsi Produk <span className="text-red-400">*</span>
            </label>
            <textarea
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleInputChange}
              disabled={loading}
              rows="4"
              placeholder="Tuliskan deskripsi produk..."
              className="
                w-full bg-white/5 border border-white/10 rounded-lg p-3 
                text-sm text-white placeholder-zinc-500 resize-none
                focus:border-white/20 focus:outline-none
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            ></textarea>
          </div>

          {/* Tombol Simpan */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="
              w-full bg-white/10 hover:bg-white/20 border border-white/10 
              text-white font-medium rounded-lg py-3 transition
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                </svg>
                Menyimpan...
              </>
            ) : (
              "Simpan Produk"
            )}
          </button>
        </div>
      </div>

      {/* Modal Tambah Ukuran */}
      {showTambahUkuran && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Tambah Ukuran</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Nama Ukuran <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="nama"
                  value={ukuranForm.nama}
                  onChange={handleUkuranChange}
                  placeholder="Contoh: Small, Medium, Large, 250ml, 500ml"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Harga (Rp) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="harga"
                  value={ukuranForm.harga}
                  onChange={handleUkuranChange}
                  placeholder="Contoh: 25000"
                  min="0"
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTambahUkuran(false)}
                className="flex-1 border border-white/10 py-2 px-4 rounded-lg hover:border-white/30 transition"
              >
                Batal
              </button>
              <button
                onClick={tambahUkuran}
                className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 py-2 px-4 rounded-lg transition"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TambahProduk;