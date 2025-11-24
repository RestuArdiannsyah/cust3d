import { ShoppingBag, Sparkles } from "lucide-react";

const ProdukFrame = () => {
  const produkItems = [
    {
      img: "https://images.unsplash.com/photo-1709980378439-41a5fc8d3be3?q=80&w=689&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dw=400",
      title: "Gantungan Kunci Custom",
      price: "Rp 15.000",
      desc: "Custom design sesuai keinginan",
    },
    {
      img: "https://images.unsplash.com/photo-1522292962303-4b234c678661?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dw=400",
      title: "Sticker Custom",
      price: "Rp 5.000",
      desc: "Berbagai ukuran tersedia",
    },
    {
      img: "https://plus.unsplash.com/premium_photo-1693242804614-5d3955b1fb7b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dw=400",
      title: "Totebag Custom",
      price: "Rp 25.000",
      desc: "Material berkualitas tinggi",
    },
  ];

  const temaItems = [
    {
      img: "https://plus.unsplash.com/premium_photo-1708368307383-37c616b5ae21?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzd8fGFrc2Vzb3JpcyUyMGdhbnR1bmdhbiUyMGt1bmNpfGVufDB8fDB8fHwww=400",
      title: "Tema Gantungan Kunci",
      designs: "50+ Designs",
    },
    {
      img: "https://images.unsplash.com/photo-1625768376503-68d2495d78c5?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dw=400",
      title: "Tema Stiker",
      designs: "100+ Designs",
    },
    {
      img: "https://images.unsplash.com/photo-1678922098020-95700a892472?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dw=400",
      title: "Tema Totebag",
      designs: "30+ Designs",
    },
  ];

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center gap-16 xl:px-52 lg:px-20 md:px-12 px-6 py-20">
      {/* ===================== PRODUK SECTION ===================== */}
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
        {produkItems.map((item, i) => (
          <div
            key={i}
            className="group relative border border-white/10 rounded-3xl bg-linear-to-br from-white/5 to-white/0.2 backdrop-blur-md p-6 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02] hover:border-purple-500/30 overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-linear-to-br from-purple-500/0 via-pink-500/0 to-purple-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl" />

            {/* Image container */}
            <div className="relative overflow-hidden rounded-2xl mb-5 bg-white/5">
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h2 className="tracking-tight font-bold text-xl md:text-2xl text-white">
                {item.title}
              </h2>

              <p className="text-sm text-white/50 leading-relaxed">
                {item.desc}
              </p>

              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-xs text-white/40 font-medium">
                  Mulai dari
                </span>
                <span className="text-2xl font-bold bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {item.price}
                </span>
              </div>

              {/* CTA Button */}
              <button className="w-full mt-4 py-3 px-4 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-sm transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 shadow-lg shadow-purple-500/30">
                Pesan Sekarang
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===================== TEMA DESIGN SECTION ===================== */}
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
          <div
            key={i}
            className="group relative border border-white/10 rounded-3xl bg-linear-to-br from-white/5 to-white/0.2 backdrop-blur-md p-6 shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:scale-[1.02] hover:border-blue-500/30 overflow-hidden"
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

              <button className="w-full mt-3 py-3 px-4 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-semibold text-sm transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 shadow-lg shadow-blue-500/30">
                Lihat Koleksi
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProdukFrame;
