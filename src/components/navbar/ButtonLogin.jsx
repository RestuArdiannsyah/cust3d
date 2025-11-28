import { Link } from "react-router-dom";
import { Store } from "lucide-react";

const ButtonLogin = () => {
  return (
    <div className="flex items-center gap-4">
      <Link
        to="/toko"
        className="border border-white/10 p-3 bg-white/15 backdrop-blur-xs  rounded-full hover:bg-white/20 transition duration-300"
      >
        {/* <img src={googleIcon} alt="Google" className="w-5 h-5" /> */}
        <Store />
      </Link>
      <Link
        to="/login"
        className="border border-white/10 py-3 bg-white/15 backdrop-blur-xs px-6 rounded-full hover:bg-white/20 transition duration-300"
      >
        {/* <img src={googleIcon} alt="Google" className="w-5 h-5" /> */}
        Mulai Sekarang
      </Link>
    </div>
  );
};

export default ButtonLogin;
