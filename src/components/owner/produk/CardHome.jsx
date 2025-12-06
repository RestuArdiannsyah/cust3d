import { Link } from "react-router-dom";

const ProductCard = ({ to, image, name, price, ukuran }) => {
  // Fungsi untuk menentukan harga yang akan ditampilkan
  const getDisplayPrice = () => {
    // Jika produk memiliki ukuran, ambil harga termurah
    if (ukuran && Array.isArray(ukuran) && ukuran.length > 0) {
      const hargaTermurah = Math.min(...ukuran.map(u => u.harga));
      return {
        price: hargaTermurah,
        hasMultipleSizes: ukuran.length > 1,
        sizeCount: ukuran.length
      };
    }
    
    // Jika tidak ada ukuran, gunakan harga default
    return {
      price: price || 0,
      hasMultipleSizes: false,
      sizeCount: 0
    };
  };

  const displayInfo = getDisplayPrice();
  const formattedPrice = displayInfo.price.toLocaleString("id-ID");

  return (
    <Link
      to={to}
      className="
        block border border-white/10 hover:border-white/30 
        rounded-xl shadow-md overflow-hidden
        hover:shadow-xl hover:shadow-zinc-50/10 
        transition duration-300
        bg-white/5
        group
      "
    >
      {/* Container Gambar */}
      <div className="w-full aspect-square overflow-hidden bg-white/10">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
          }}
        />
        
        {/* Badge untuk produk dengan multiple ukuran */}
        {displayInfo.hasMultipleSizes && (
          <div className="absolute top-2 right-2 bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full">
            {displayInfo.sizeCount} ukuran
          </div>
        )}
      </div>

      {/* Info Produk */}
      <div className="p-4">
        <h3 className="text-base font-semibold line-clamp-2 min-h-[3rem]">
          {name}
        </h3>

        {/* Tampilan harga berdasarkan kondisi */}
        <div className="mt-2">
          {displayInfo.hasMultipleSizes ? (
            // Tampilan untuk produk dengan multiple ukuran
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <span className="text-xs text-green-400">Mulai dari</span>
                <span className="text-sm font-bold text-white">
                  Rp {formattedPrice}
                </span>
              </div>
              <div className="text-xs text-zinc-400">
                {displayInfo.sizeCount} variasi harga
              </div>
            </div>
          ) : (
            // Tampilan untuk produk tanpa ukuran atau hanya 1 ukuran
            <p className="text-sm font-bold text-white/70">
              Rp {formattedPrice}
            </p>
          )}
        </div>
      </div>    
    </Link>
  );
};

export default ProductCard;