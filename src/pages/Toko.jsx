import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Globe, Store, ArrowRight } from "lucide-react";

// Firebase service
import { getAllProduk } from "../services/produk/ProdukServices";

const Toko = () => {
  // ---------------------- STATE ----------------------
  const [activeTab, setActiveTab] = useState("website");
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------------- STORE LINKS ----------------------
  const onlineStoreLinks = [
    {
      name: "Shopee",
      icon: "🛒",
      url: "https://shopee.co.id/toko-anda",
      color: "bg-orange-600 hover:bg-orange-500",
    },
    {
      name: "Tokopedia",
      icon: "🟢",
      url: "https://www.tokopedia.com/toko-anda",
      color: "bg-green-600 hover:bg-green-500",
    },
    {
      name: "WhatsApp",
      icon: "💬",
      url: "https://wa.me/628123456789",
      color: "bg-teal-600 hover:bg-teal-500",
    },
  ];

  // ---------------------- FETCH PRODUK ----------------------
  useEffect(() => {
    if (activeTab === "website") loadProduk();
  }, [activeTab]);

  const loadProduk = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllProduk();

      if (result.success) {
        const validatedProducts = result.data.map((produk) => ({
          ...produk,
          gambar:
            produk.gambarUtama ||
            (Array.isArray(produk.gambar) ? produk.gambar[0] : produk.gambar) ||
            null,
          hargaRupiah: new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(produk.harga || 0),
        }));

        setProdukList(validatedProducts.slice(0, 6));
      } else {
        setError(result.error || "Gagal mengambil data produk");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat memuat produk");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------- PRODUCT CARD ----------------------
  const ProductCard = ({ product }) => (
    <div
      className="relative block border border-white/10 rounded-3xl
                p-6
               shadow-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 
               transition duration-300"
    >
      {/* Gambar Produk */}
      <div className="relative overflow-hidden rounded-2xl mb-5 bg-white/5 flex items-center justify-center h-64">
        {product.gambar ? (
          <img
            src={product.gambar}
            alt={product.namaProduk}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/10 text-white/50">
            No Image
          </div>
        )}
      </div>

      {/* Info Produk */}
      <div className="space-y-2">
        <h2 className="tracking-tight font-bold text-xl md:text-2xl text-white line-clamp-2">
          {product.namaProduk}
        </h2>

        <p className="text-pink-400 font-semibold text-lg md:text-xl">
          {product.hargaRupiah}
        </p>

        {/* Tombol Detail */}
        <Link
          to={`/checkout/${product.id}`}
          className="block w-full mt-3 py-3 px-4 text-center border font-semibold 
                   border-white/20 rounded-lg cursor-pointer
                   transition duration-300
                   hover:bg-white hover:text-black"
        >
          Beli Sekarang
        </Link>
      </div>
    </div>
  );

  // ---------------------- TAB BUTTON ----------------------
  const TabButton = ({ id, icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300
        ${
          activeTab === id
            ? "bg-white text-zinc-900 shadow-lg"
            : "text-white/70 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      {icon}
      {label}
    </button>
  );

  // ---------------------- PAGE RENDER ----------------------
  return (
    <div className="min-h-screen">
      <div className="xl:px-52 lg:px-20 md:px-12 px-6 py-10">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between gap-4 sticky top-0 z-10 bg-[#070016] py-4">
          <h1
            className="font-extrabold tracking-tighter text-4xl md:text-5xl lg:text-6xl 
                         bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent"
          >
            Toko Kami
          </h1>

          <Link
            to="/"
            className="border border-white/10 py-2 px-4 rounded-lg hover:bg-white hover:text-black 
                       transition duration-300"
          >
            Kembali
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 border-b border-white/10 pb-6 mb-10">
          <TabButton
            id="website"
            icon={<Globe className="w-5 h-5" />}
            label="Website Store"
          />
          <TabButton
            id="online"
            icon={<Store className="w-5 h-5" />}
            label="Toko Online"
          />
        </div>

        {/* ===================== CONTENT ===================== */}

        {/* Website Store */}
        {activeTab === "website" && (
          <div className="w-full min-h-[500px] py-10 flex flex-col items-center gap-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
              {/* Skeleton */}
              {loading &&
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="border border-white/10 rounded-3xl p-6 animate-pulse bg-white/5 h-[400px]"
                  >
                    <div className="w-full h-64 bg-white/10 rounded-2xl mb-5"></div>
                    <div className="h-6 bg-white/10 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-pink-500/10 rounded w-1/2"></div>
                    <div className="h-10 bg-white/10 rounded-xl mt-3 w-full"></div>
                  </div>
                ))}

              {/* Error */}
              {!loading && error && (
                <div className="md:col-span-2 lg:col-span-3 bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
                  <p className="text-red-400 mb-2">⚠️ {error}</p>

                  <button
                    onClick={loadProduk}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-lg transition text-sm"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              {/* Empty */}
              {!loading && !error && produkList.length === 0 && (
                <div className="md:col-span-2 lg:col-span-3 bg-white/5 border border-white/10 rounded-lg p-12 text-center">
                  <p className="text-white/50 text-lg">Belum ada produk.</p>
                </div>
              )}

              {/* Produk */}
              {!loading &&
                !error &&
                produkList.length > 0 &&
                produkList.map((produk) => (
                  <ProductCard key={produk.id} product={produk} />
                ))}
            </div>
          </div>
        )}

        {/* Toko Online */}
        {activeTab === "online" && (
          <div className="w-full py-10">
            <h2 className="text-3xl font-bold mb-6">
              Toko Online <span className="caveat text-4xl">cust3d</span>
            </h2>

            <p className="text-white/70 mb-8 max-w-2xl">
              Belanja produk kami melalui aplikasi toko online favorit Anda.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {onlineStoreLinks.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${item.color} flex items-center justify-between p-6 rounded-2xl 
                             shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-xl font-bold">{item.name}</span>
                  </div>

                  <ArrowRight className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toko;
