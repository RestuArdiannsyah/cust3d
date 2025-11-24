import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-[#070016] border-t border-white/10 py-8 xl:px-52 lg:px-28 md:px-16 px-6 mt-12">
      <div className="flex flex-col gap-6">
        {/* TOP ROW - Logo & Nav */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* LEFT - Logo/Brand */}
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-3xl caveat">
              Cust3D
            </span>
          </div>

          {/* RIGHT - Navigation Links */}
          <div className="flex flex-wrap items-center gap-6 md:gap-8 text-sm">
            <a
              href="#home"
              className="text-zinc-400 hover:text-white transition duration-300"
            >
              Beranda
            </a>
            <a
              href="#tentang-kami"
              className="text-zinc-400 hover:text-white transition duration-300"
            >
              Tentang Kami
            </a>
            <a
              href="#produk"
              className="text-zinc-400 hover:text-white transition duration-300"
            >
              Produk
            </a>
            <a
              href="#kontak"
              className="text-zinc-400 hover:text-white transition duration-300"
            >
              Kontak
            </a>
          </div>
        </div>

        {/* BOTTOM ROW - Credits & Copyright */}
        <div className="flex flex-col gap-1 text-sm text-zinc-400">
          <div className="flex items-center gap-1">
            <span>Sebuah bisnis yang dibuat oleh</span>
            <Heart className="w-4 h-4 text-purple-500 fill-purple-500" />
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition duration-300"
            >
              Tim <span className="caveat text-lg">cust3D</span>
            </a>
          </div>
          <span className="text-xs text-zinc-500">© 2025 Cust3D</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
