import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Globe, Store, ArrowRight, ShoppingBag, Tag } from "lucide-react";

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
        const validatedProducts = result.data.map((produk) => {
          let hargaDisplay;
          let hargaTermurah = 0;
          let hargaTermahal = 0;
          let jumlahUkuran = 0;
          let displayFormat = "single"; // 'single' atau 'range'
          let hargaFormatted = "";

          if (
            produk.ukuran &&
            Array.isArray(produk.ukuran) &&
            produk.ukuran.length > 0
          ) {
            // Produk memiliki ukuran
            jumlahUkuran = produk.ukuran.length;

            // Hitung harga termurah dan termahal
            const hargaList = produk.ukuran.map((u) => u.harga);
            hargaTermurah = Math.min(...hargaList);
            hargaTermahal = Math.max(...hargaList);

            if (jumlahUkuran === 1) {
              // Hanya 1 ukuran, tampilkan harga tunggal
              hargaDisplay = hargaTermurah;
              displayFormat = "single";
              hargaFormatted = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(hargaDisplay);
            } else {
              // Multiple ukuran, tampilkan range
              displayFormat = "range";
              const formatTermurah = new Intl.NumberFormat("id-ID", {
                minimumFractionDigits: 0,
              }).format(hargaTermurah);
              const formatTermahal = new Intl.NumberFormat("id-ID", {
                minimumFractionDigits: 0,
              }).format(hargaTermahal);
              hargaFormatted = `Rp ${formatTermurah} - Rp ${formatTermahal}`;
            }
          } else {
            // Produk tanpa ukuran
            jumlahUkuran = 0;
            hargaDisplay = produk.harga || 0;
            hargaTermurah = hargaDisplay;
            hargaTermahal = hargaDisplay;
            displayFormat = "single";
            hargaFormatted = new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(hargaDisplay);
          }

          return {
            ...produk,
            gambar:
              produk.gambarUtama ||
              (Array.isArray(produk.gambar)
                ? produk.gambar[0]
                : produk.gambar) ||
              null,
            hargaDisplay,
            hargaTermurah,
            hargaTermahal,
            hargaFormatted,
            displayFormat,
            jumlahUkuran,
          };
        });

        setProdukList(validatedProducts);
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
                p-6 shadow-2xl overflow-hidden hover:bg-white/10 hover:border-white/20 
               transition duration-300 group h-full flex flex-col"
    >
      {/* Gambar Produk */}
      <div className="relative overflow-hidden rounded-2xl mb-5 bg-white/5 flex items-center justify-center h-64">
        {product.gambar ? (
          <img
            src={product.gambar}
            alt={product.namaProduk}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/10 text-white/50">
            <ShoppingBag className="w-16 h-16 opacity-30" />
          </div>
        )}

        {/* Badge untuk produk dengan ukuran */}
        {product.jumlahUkuran > 0 && (
          <div className="absolute top-3 right-3 bg-blue-500/90 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-lg flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {product.jumlahUkuran} ukuran
          </div>
        )}
      </div>

      {/* Info Produk */}
      <div className="space-y-3 flex-1">
        <h2 className="tracking-tight font-bold text-xl md:text-2xl text-white line-clamp-2 min-h-[3.5rem]">
          {product.namaProduk}
        </h2>

        {/* Display Harga */}
        <div className="space-y-1">
          {product.displayFormat === "range" ? (
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-pink-400 font-semibold text-lg">
                  {product.hargaFormatted}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-pink-400 font-semibold text-lg md:text-xl">
                {product.hargaFormatted}
              </span>
              {product.jumlahUkuran === 1 && (
                <span className="text-xs text-zinc-400 bg-blue-500/10 px-2 py-1 rounded">
                  1 ukuran
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tombol Beli */}
        <div className="mt-auto pt-4">
          <Link
            to={`/checkout/${product.id}`}
            state={{ product }}
            className="block w-full py-3 px-4 text-center border font-semibold 
                       border-white/20 rounded-lg cursor-pointer
                       transition duration-300
                       hover:bg-white hover:text-black"
          >
            Beli Sekarang
          </Link>
        </div>
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
          <div>
            <h1
              className="font-extrabold tracking-tighter text-4xl md:text-5xl lg:text-6xl 
                         bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent mb-2"
            >
              Toko Kami
            </h1>
            <p className="text-zinc-400 text-sm md:text-base">
              {produkList.some((p) => p.displayFormat === "range")
                ? "Produk dengan ukuran menampilkan range harga termurah - termahal"
                : "Temukan produk terbaik kami"}
            </p>
          </div>

          <Link
            to="/"
            className="border border-white/10 py-2 px-4 rounded-lg hover:bg-white hover:text-black 
                       transition duration-300 whitespace-nowrap"
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
          <div className="w-full min-h-[500px] py-10">
            {/* Grid Produk */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
              {/* Loading */}
              {loading &&
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="border border-white/10 rounded-3xl p-6 animate-pulse bg-white/5 h-[450px]"
                  >
                    <div className="w-full h-64 bg-white/10 rounded-2xl mb-5"></div>
                    <div className="h-6 bg-white/10 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-pink-500/10 rounded w-1/2 mb-4"></div>
                    <div className="h-10 bg-white/10 rounded-xl mt-3 w-full"></div>
                  </div>
                ))}

              {/* Error */}
              {!loading && error && (
                <div className="md:col-span-3 bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center">
                  <p className="text-red-400 mb-4 text-lg">{error}</p>
                  <button
                    onClick={loadProduk}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-3 rounded-lg transition font-medium"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              {/* Empty */}
              {!loading && !error && produkList.length === 0 && (
                <div className="md:col-span-3 bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <p className="text-white/50 text-lg">
                    Belum ada produk yang tersedia.
                  </p>
                </div>
              )}

              {/* Produk List */}
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
              Semua produk dengan berbagai ukuran tersedia di platform berikut.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {onlineStoreLinks.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${item.color} flex items-center justify-between p-6 rounded-2xl 
                             shadow-xl transition-all duration-300 hover:scale-[1.02]`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <span className="text-xl font-bold block">
                        {item.name}
                      </span>
                      <span className="text-sm opacity-90">
                        Buka di aplikasi
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Informasi tambahan */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-3">Tentang Harga Produk</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="text-green-400 mt-0.5">✓</div>
                  <div>
                    <p className="font-medium">Produk dengan ukuran</p>
                    <p className="text-sm text-zinc-400">
                      Menampilkan range harga (Rp termurah - termahal) karena
                      memiliki beberapa pilihan ukuran dengan harga berbeda.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-400 mt-0.5">✓</div>
                  <div>
                    <p className="font-medium">Produk tanpa ukuran</p>
                    <p className="text-sm text-zinc-400">
                      Menampilkan harga tunggal karena hanya tersedia dalam satu
                      ukuran/harga.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toko;
