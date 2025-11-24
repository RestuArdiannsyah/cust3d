import { Link } from "react-router-dom";

const ButtonLogin = () => {
  return (
    <div>
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
