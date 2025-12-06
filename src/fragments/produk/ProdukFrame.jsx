import React, { useState, useEffect } from "react";
import { ShoppingBag, Sparkles, Tag } from "lucide-react";
import { getAllProduk } from "../../services/produk/ProdukServices";

const ProdukFrame = () => {
  const [produkList, setProdukList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const temaItems = [
    {
      img: "https://plus.unsplash.com/premium_photo-1708368307383-37c616b5ae21?w=400",
      title: "Tema Gantungan Kunci",
      designs: "50+ Designs",
    },
    {
      img: "https://images.unsplash.com/photo-1625768376503-68d2495d78c5?w=400",
      title: "Tema Stiker",
      designs: "100+ Designs",
    },
  ];

  useEffect(() => {
    loadProduk();
  }, []);

  const loadProduk = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllProduk();

      if (result.success) {
        const validated = result.data.map((produk) => {
          // Tentukan format harga
          let hargaTampil = "";
          let jumlahUkuran = produk.ukuran?.length || 0;

          if (jumlahUkuran > 1) {
            // Multiple ukuran: tampilkan range harga
            const hargaTermurah = Math.min(...produk.ukuran.map(u => u.harga));
            const hargaTermahal = Math.max(...produk.ukuran.map(u => u.harga));
            const formatMin = new Intl.NumberFormat("id-ID").format(hargaTermurah);
            const formatMax = new Intl.NumberFormat("id-ID").format(hargaTermahal);
            hargaTampil = `Rp ${formatMin} - Rp ${formatMax}`;
          } else if (jumlahUkuran === 1) {
            // 1 ukuran: tampilkan harga tunggal
            const harga = produk.ukuran[0].harga;
            hargaTampil = new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(harga);
          } else {
            // Tidak ada ukuran: gunakan harga default
            hargaTampil = new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(produk.harga || 0);
          }

          return {
            ...produk,
            gambar:
              produk.gambarUtama ||
              (Array.isArray(produk.gambar)
                ? produk.gambar[0]
                : produk.gambar) ||
              null,
            hargaTampil,
            jumlahUkuran,
          };
        });

        setProdukList(validated.slice(0, 6));
      } else {
        setError(result.error || "Gagal memuat produk");
      }
    } catch {
      setError("Terjadi kesalahan saat memuat produk");
    } finally {
      setLoading(false);
    }
  };

  /* ==== CARD STYLE ==== */
  const cardClass =
    "relative border border-white/10 rounded-3xl bg-white/5 backdrop-blur-md " +
    "p-4 transition duration-300 hover:bg-white/20 hover:border-white/30 " +
    "overflow-hidden cursor-default group";

  const imgContainer =
    "relative overflow-hidden rounded-2xl mb-4 bg-white/5 h-52";

  const ProductCard = ({ product }) => (
    <div className={cardClass}>
      <div className={imgContainer}>
        {product.gambar ? (
          <img
            src={product.gambar}
            alt={product.namaProduk}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40">
            <ShoppingBag className="w-12 h-12 opacity-30" />
          </div>
        )}

        {/* Badge untuk produk dengan ukuran */}
        {product.jumlahUkuran > 0 && (
          <div className="absolute top-3 right-3 bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full font-medium">
            {product.jumlahUkuran} ukuran
          </div>
        )}
      </div>

      <h2 className="font-bold text-lg md:text-xl text-white line-clamp-2 mb-2">
        {product.namaProduk}
      </h2>

      {/* Display harga */}
      <div className="mt-auto">
        <div className="flex items-baseline gap-2">
          <span className="text-pink-400 font-semibold text-base md:text-lg">
            {product.hargaTampil}
          </span>
        </div>
      </div>
    </div>
  );

  const TemaCard = ({ item }) => (
    <div className={cardClass}>
      <div className={imgContainer}>
        <img
          src={item.img}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />

        <div className="absolute top-4 right-4 px-3 py-1 bg-blue-500/90 text-xs rounded-full font-semibold">
          {item.designs}
        </div>
      </div>

      <h2 className="font-bold text-lg md:text-xl text-white">{item.title}</h2>
    </div>
  );

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-10 xl:px-52 lg:px-20 md:px-12 px-6 py-12">
      <h1 className="tracking-tighter text-5xl font-extrabold mb-4 text-center lg:text-left">
        Produk Dan Desain
      </h1>

      <div className="w-full flex items-center justify-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/40">
          <ShoppingBag className="w-4 h-4" />
          <span className="font-medium text-sm">Produk Kami</span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/40">
          <Sparkles className="w-4 h-4" />
          <span className="font-medium text-sm">Tema Design</span>
        </div>
      </div>

      {/* GRID PRODUK + TEMA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        {loading &&
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-white/10 rounded-3xl p-4 bg-white/5 animate-pulse h-[320px]"
            ></div>
          ))}

        {!loading &&
          !error &&
          produkList.map((produk) => (
            <ProductCard key={produk.id} product={produk} />
          ))}

        {temaItems.map((item, i) => (
          <TemaCard key={i} item={item} />
        ))}
      </div>

      <div className="w-full text-center mt-4">
        <a
          href="/toko"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full font-semibold transition duration-300"
        >
          Lihat Semua Produk
        </a>
      </div>
    </div>
  );
};

export default ProdukFrame;