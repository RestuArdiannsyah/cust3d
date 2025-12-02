const Nav = () => {
  return (
    <div className="flex md:flex-row flex-col md:items-center items-start md:gap-10 gap-4 border border-white/10 md:py-3 py-4 bg-white/15 backdrop-blur-xs md:px-16 px-6 md:rounded-full rounded-2xl">
      <a
        href="#home"
        className="hover:text-blue-600 transition duration-300 hover:font-semibold w-full md:w-auto"
      >
        Beranda
      </a>

      <a
        href="#tentang-kami"
        className="hover:text-blue-600 transition duration-300 hover:font-semibold w-full md:w-auto"
      >
        Tentang Kami
      </a>

      <a
        href="#tentang-kami"
        className="hover:text-blue-600 transition duration-300 hover:font-semibold w-full md:w-auto"
      >
        Alur Pemesanan
      </a>

      <a
        href="#produk"
        className="hover:text-blue-600 transition duration-300 hover:font-semibold w-full md:w-auto"
      >
        Produk
      </a>

      <a
        href="#testimoni"
        className="hover:text-blue-600 transition duration-300 hover:font-semibold w-full md:w-auto"
      >
        Testimoni
      </a>

      <a
        href="#kontak"
        className="hover:text-blue-600 transition duration-300 hover:font-semibold w-full md:w-auto"
      >
        Kontak
      </a>
    </div>
  );
};

export default Nav;
