import { Link } from "react-router-dom";

const ProductCard = ({ to, image, name, price, ukuran }) => {
  // Fungsi untuk format harga
  const formatHarga = (harga) => {
    return `Rp ${harga.toLocaleString("id-ID")}`;
  };

  // Tentukan harga yang ditampilkan
  let hargaTampil = "";
  let jumlahUkuran = ukuran?.length || 0;

  if (jumlahUkuran > 1) {
    // Multiple ukuran: tampilkan range harga termurah - termahal
    const hargaTermurah = Math.min(...ukuran.map(u => u.harga));
    const hargaTermahal = Math.max(...ukuran.map(u => u.harga));
    hargaTampil = `${formatHarga(hargaTermurah)} - ${formatHarga(hargaTermahal)}`;
  } else if (jumlahUkuran === 1) {
    // 1 ukuran: tampilkan harga tunggal
    hargaTampil = formatHarga(ukuran[0].harga);
  } else {
    // Tidak ada ukuran: gunakan harga default
    hargaTampil = formatHarga(price || 0);
  }

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
      <div className="w-full aspect-square overflow-hidden bg-white/10 relative">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
          }}
        />
        
        {/* Badge jika ada multiple ukuran */}
        {jumlahUkuran > 1 && (
          <div className="absolute top-2 right-2 bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full">
            {jumlahUkuran} ukuran
          </div>
        )}
      </div>

      {/* Info Produk */}
      <div className="p-4">
        <h3 className="text-base font-semibold line-clamp-2 min-h-[3rem] text-white">
          {name}
        </h3>

        {/* Display Harga */}
        <div className="mt-2">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-pink-400">
              {hargaTampil}
            </span>
          </div>
          
          
        </div>
      </div>    
    </Link>
  );
};

export default ProductCard;