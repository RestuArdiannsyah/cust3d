import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Sparkles, Loader2, ArrowRight } from "lucide-react";
// Pastikan path ini benar sesuai struktur proyek Anda
import { getAllProduk } from "../../services/produk/ProdukServices";

const ProdukFrame = () => {
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data statis untuk Tema Design
  const temaItems = [
    {
      img: "https://plus.unsplash.com/premium_photo-1708368307383-37c616b5ae21?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzd8fGFrc2Vzb3JpcyUyMGdhbnR1bmdhbiUyMGt1bmNpfGVufDB8fDB8fHwww=400",
      title: "Tema Gantungan Kunci",
      designs: "50+ Designs",
      link: "/galeri/gantungan-kunci", // Contoh link navigasi
    },
    {
      img: "https://images.unsplash.com/photo-1625768376503-68d2495d78c5?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dw=400",
      title: "Tema Stiker",
      designs: "100+ Designs",
      link: "/galeri/stiker", // Contoh link navigasi
    },
    {
      img: "https://images.unsplash.com/photo-1678922098020-95700a892472?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dw=400",
      title: "Tema Totebag",
      designs: "30+ Designs",
      link: "/galeri/totebag", // Contoh link navigasi
    },
  ];

  // ====================== FETCH DATA DARI FIREBASE ======================

  useEffect(() => {
    loadProduk();
  }, []);

  const loadProduk = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllProduk();

      if (result.success) {
        // Validasi dan ambil gambar utama, serta format harga
        const validatedProducts = result.data.map((produk) => ({
          ...produk,
          // Ambil gambar utama, atau gambar pertama dari array, atau null
          gambar:
            produk.gambarUtama ||
            (Array.isArray(produk.gambar) ? produk.gambar[0] : produk.gambar) ||
            null,
          // Format harga ke Rupiah
          hargaRupiah: new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(produk.harga || 0),
        }));

        // Hanya tampilkan 6 produk teratas sebagai 'Produk Unggulan'
        setProdukList(validatedProducts.slice(0, 6));
      } else {
        setError(result.error || "Gagal mengambil data produk");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memuat produk");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  // ====================== KOMPONEN CARD PRODUK ======================

  const ProductCard = ({ product }) => (
    <Link
      className="group relative border border-white/10 rounded-3xl bg-linear-to-br from-white/5 to-white/0.2 backdrop-blur-md p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02] hover:border-purple-500/30 overflow-hidden block"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-500/0 via-pink-500/0 to-purple-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl" />

      {/* Image container */}
      <div className="relative overflow-hidden rounded-2xl mb-5 bg-white/5 flex items-center justify-center h-64">
        {product.gambar ? (
          <img
            src={product.gambar}
            alt={product.namaProduk}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/10 text-white/50">
            No Image
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h2 className="tracking-tight font-bold text-xl md:text-2xl text-white line-clamp-2">
          {product.namaProduk}
        </h2>
        <p className="text-pink-400 font-semibold text-lg md:text-xl">
          {product.hargaRupiah}
        </p>
      </div>
    </Link>
  );

  // ====================== RENDER KOMPONEN ======================

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center gap-16 xl:px-52 lg:px-20 md:px-12 px-6 py-20">
      {/* ===================== PRODUK SECTION (DARI FIREBASE) ===================== */}
      <div className="w-full text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-2">
          <ShoppingBag className="w-4 h-4" />
          <span className="text-sm font-medium">Produk Kami</span>
        </div>
        <h1 className="tracking-tighter font-extrabold text-4xl md:text-5xl lg:text-6xl bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
          Produk Unggulan
        </h1>
        <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto">
          Pilihan produk custom berkualitas dengan harga terjangkau
        </p>
      </div>

      {/* Grid Produk */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
        {loading && (
          // Skeleton Loading
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-white/10 rounded-3xl p-6 animate-pulse bg-white/5 h-[400px]"
              >
                <div className="w-full h-64 bg-white/10 rounded-2xl mb-5"></div>
                <div className="h-6 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-pink-500/10 rounded w-1/2"></div>
              </div>
            ))}
          </>
        )}

        {!loading && error && (
          // Error State
          <div className="md:col-span-2 lg:col-span-3 bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center w-full">
            <p className="text-red-400 mb-2">⚠️ Error: {error}</p>
            <button
              onClick={loadProduk}
              className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-lg transition text-sm"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && produkList.length === 0 && (
          // Empty State
          <div className="md:col-span-2 lg:col-span-3 bg-white/5 border border-white/10 rounded-lg p-12 text-center w-full">
            <p className="text-white/50 text-lg mb-2">
              Belum ada produk yang tersedia saat ini.
            </p>
          </div>
        )}

        {/* List Produk */}
        {!loading &&
          !error &&
          produkList.length > 0 &&
          produkList.map((produk) => (
            <ProductCard key={produk.id} product={produk} />
          ))}
      </div>

      <div className="w-full text-center mt-4">
        <Link
          to="/toko" // Ganti dengan path ke halaman semua produk Anda
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full font-semibold transition"
        >
          Beli Sekarang <ArrowRight className="w-5 h-5 ml-1" />
        </Link>
      </div>

      {/* --- */}

      {/* ===================== TEMA DESIGN SECTION (STATIC) ===================== */}
      <div className="w-full text-center space-y-3 mt-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30 mb-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Galeri Design</span>
        </div>
        <h1 className="tracking-tighter font-extrabold text-5xl bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
          Tema Design
        </h1>
        <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto">
          Ratusan design menarik siap untuk dipilih
        </p>
      </div>

      {/* Grid Tema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
        {temaItems.map((item, i) => (
          <Link
            to={item.link}
            key={i}
            className="group relative border border-white/10 rounded-3xl bg-linear-to-br from-white/5 to-white/0.2 backdrop-blur-md p-6 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02] hover:border-blue-500/30 overflow-hidden block"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/0 via-cyan-500/0 to-blue-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl" />

            {/* Image container - centered */}
            <div className="relative overflow-hidden rounded-2xl mb-5 bg-white/5 flex items-center justify-center h-64">
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-blue-500/90 backdrop-blur-sm rounded-full text-xs font-semibold shadow-lg">
                {item.designs}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h2 className="tracking-tight font-bold text-xl md:text-2xl text-white">
                {item.title}
              </h2>

              <div className="w-full mt-3 py-3 px-4 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-semibold text-sm transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 shadow-lg shadow-blue-500/30 text-center flex items-center justify-center gap-2">
                Lihat Koleksi <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProdukFrame;
