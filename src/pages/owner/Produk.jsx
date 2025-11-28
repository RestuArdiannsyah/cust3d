import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/owner/produk/Card";
import { getAllProduk } from "../../services/produk/ProdukServices";

const Produk = () => {
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProduk();
  }, []);

  const loadProduk = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getAllProduk();
      
      if (result.success) {
        // Pastikan setiap produk punya gambar yang valid
        const validatedProducts = result.data.map(produk => ({
          ...produk,
          // Gunakan gambarUtama jika ada, atau gambar array pertama, atau null
          gambar: produk.gambarUtama || 
                  (Array.isArray(produk.gambar) ? produk.gambar[0] : produk.gambar) || 
                  null
        }));
        
        setProdukList(validatedProducts);
      } else {
        setError(result.error || "Gagal mengambil data produk");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memuat produk");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col items-start justify-between mb-6 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Kelola Produk</h1>
          <p className="text-zinc-400">
            {loading ? "Memuat..." : `${produkList.length} produk tersedia`}
          </p>
        </div>
        
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={loadProduk}
            disabled={loading}
            className="
              border py-2 px-4 border-white/10 rounded-lg 
              hover:border-white/30 transition duration-300 
              cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
          
          <Link
            to="/owner/tambah-produk"
            className="
              border py-2 px-4 border-white/10 rounded-lg 
              hover:border-white/30 transition duration-300 
              cursor-pointer bg-white/5
            "
          >
            + Tambah Produk
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="border border-white/10 rounded-xl overflow-hidden animate-pulse bg-white/5"
            >
              <div className="w-full aspect-square bg-white/10"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadProduk}
            className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-lg transition"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && produkList.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-white/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-white/50 text-lg mb-2">Belum ada produk</p>
          <p className="text-white/30 text-sm mb-4">
            Tambahkan produk pertama Anda sekarang
          </p>
          <Link
            to="/owner/tambah-produk"
            className="
              inline-block bg-white/10 hover:bg-white/20 
              border border-white/10 px-6 py-2 rounded-lg transition
            "
          >
            Tambah Produk
          </Link>
        </div>
      )}

      {/* List Produk */}
      {!loading && !error && produkList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {produkList.map((produk) => (
            <ProductCard
              key={produk.id}
              to={`/owner/detail-produk/${produk.id}`}
              image={produk.gambar}
              name={produk.namaProduk}
              price={produk.harga}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Produk;