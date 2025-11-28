import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getProdukById, hapusProduk } from "../../../services/produk/ProdukServices";

const DetailProduk = () => {
  const { id } = useParams(); // Ambil ID dari URL
  const navigate = useNavigate();
  
  const [produk, setProduk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProdukDetail();
  }, [id]);

  const loadProdukDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getProdukById(id);

      if (result.success) {
        setProduk(result.data);
      } else {
        setError(result.error || "Produk tidak ditemukan");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memuat detail produk");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduk = async () => {
    try {
      setDeleting(true);
      
      // Ambil gambarPath jika ada untuk hapus dari storage
      const result = await hapusProduk(id, produk.gambarPath);

      if (result.success) {
        // Redirect ke halaman produk setelah berhasil hapus
        navigate("/owner/produk");
      } else {
        alert(result.error || "Gagal menghapus produk");
      }
    } catch (err) {
      alert("Terjadi kesalahan saat menghapus produk");
      console.error(err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square bg-white/10 rounded-xl"></div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-square bg-white/10 rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-white/10 rounded w-3/4"></div>
              <div className="h-6 bg-white/10 rounded w-1/2"></div>
              <div className="h-32 bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link
            to="/owner/produk"
            className="inline-block bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-lg transition"
          >
            Kembali ke Daftar Produk
          </Link>
        </div>
      </div>
    );
  }

  // Jika produk tidak ada
  if (!produk) {
    return null;
  }

  // Normalisasi gambar ke array
  const images = Array.isArray(produk.gambar) 
    ? produk.gambar 
    : produk.gambar 
      ? [produk.gambar] 
      : [];

  const currentImage = images[selectedImageIndex] || null;

  return (
    <div>
      {/* Header dengan Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
          <Link to="/owner/produk" className="hover:text-white transition">
            Kelola Produk
          </Link>
          <span>/</span>
          <span className="text-white">{produk.namaProduk}</span>
        </div>
        
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold">Detail Produk</h1>
          
          <div className="flex gap-3">
            <Link
              to={`/owner/produk/edit/${id}`}
              className="border py-2 px-4 border-white/10 rounded-lg hover:border-white/30 transition duration-300 cursor-pointer"
            >
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="border py-2 px-4 border-red-500/20 text-red-400 rounded-lg hover:border-red-500/40 hover:bg-red-500/10 transition duration-300"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Kiri - Gallery Gambar */}
        <div className="space-y-4">
          {/* Gambar Utama */}
          <div className="w-full aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5">
            {currentImage ? (
              <img
                src={currentImage}
                alt={produk.namaProduk}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Thumbnail Gambar */}
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`
                    aspect-square rounded-lg overflow-hidden border-2 transition
                    ${selectedImageIndex === index 
                      ? 'border-white' 
                      : 'border-white/10 hover:border-white/30'
                    }
                  `}
                >
                  <img
                    src={img}
                    alt={`${produk.namaProduk} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Info Jumlah Gambar */}
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>
              {images.length > 0 
                ? `${selectedImageIndex + 1} / ${images.length} gambar` 
                : 'Tidak ada gambar'
              }
            </span>
            {images.length > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                  className="p-2 border border-white/10 rounded-lg hover:border-white/30 transition"
                >
                  ←
                </button>
                <button
                  onClick={() => setSelectedImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                  className="p-2 border border-white/10 rounded-lg hover:border-white/30 transition"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Kanan - Data Produk */}
        <div className="space-y-6">
          
          {/* Info Dasar */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-3xl font-bold mb-4">{produk.namaProduk}</h2>
            
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-3xl font-bold text-green-400">
                Rp {produk.harga.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-zinc-400">Status</span>
                <span className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${produk.status === 'aktif' 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }
                `}>
                  {produk.status || 'Aktif'}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-zinc-400">Jumlah Gambar</span>
                <span className="font-medium">{images.length} gambar</span>
              </div>

              {produk.tanggalDibuat && (
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-zinc-400">Tanggal Dibuat</span>
                  <span className="font-medium">
                    {new Date(produk.tanggalDibuat.seconds * 1000).toLocaleDateString('id-ID')}
                  </span>
                </div>
              )}

              {produk.dibuatOleh && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-zinc-400">Dibuat Oleh</span>
                  <span className="font-medium">{produk.dibuatOleh.nama}</span>
                </div>
              )}
            </div>
          </div>

          {/* Deskripsi */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-3">Deskripsi Produk</h3>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-line">
              {produk.deskripsi}
            </p>
          </div>

          {/* File Info */}
          {produk.namaFileGambar && produk.namaFileGambar.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3">File Gambar</h3>
              <div className="space-y-2">
                {produk.namaFileGambar.map((fileName, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-zinc-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{fileName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">Hapus Produk?</h3>
            <p className="text-zinc-400 mb-6">
              Apakah Anda yakin ingin menghapus <strong className="text-white">{produk.namaProduk}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 border border-white/10 py-2 px-4 rounded-lg hover:border-white/30 transition disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteProduk}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 py-2 px-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menghapus...
                  </>
                ) : (
                  'Hapus Produk'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DetailProduk;