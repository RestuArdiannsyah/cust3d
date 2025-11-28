import { Link } from "react-router-dom";

const ProductCard = ({ to, image, name, price }) => {
  return (
    <Link
      to={to}
      className="
        block border border-white/10 hover:border-white/30 
        rounded-xl shadow-md overflow-hidden
        hover:shadow-xl hover:shadow-zinc-50/10 
        transition duration-300
        bg-white/5
      "
    >
      {/* Container Gambar dengan aspect ratio fixed */}
      <div className="w-full aspect-square overflow-hidden bg-white/10">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover hover:scale-105 transition duration-300"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
          }}
        />
      </div>

      {/* Info Produk */}
      <div className="p-4">
        <h3 className="text-base font-semibold line-clamp-2 min-h-[3rem]">
          {name}
        </h3>

        <p className="text-sm font-bold text-white/70 mt-2">
          Rp {price.toLocaleString("id-ID")}
        </p>
      </div>    
    </Link>
  );
};

export default ProductCard;