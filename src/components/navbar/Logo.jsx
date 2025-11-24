import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link
      to="/"
      className="border border-white/10 py-3 bg-white/15 backdrop-blur-xs px-6 rounded-l-full rounded-r-full"
    >
      <h1 className="caveat text-white">cust3D</h1>
    </Link>
  );
};

export default Logo;
