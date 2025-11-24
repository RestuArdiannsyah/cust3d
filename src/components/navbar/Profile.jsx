import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Profile = () => {
  const { user, userData } = useAuth();

  const name = userData?.nama || user?.displayName || "User";
  const photo = userData?.photoURL || user?.photoURL;
  const initial =
    userData?.firstName?.[0] ||
    user?.email?.[0]?.toUpperCase() ||
    name[0]?.toUpperCase() ||
    "U";

  return (
    <Link
      to="/profile"
      className="flex items-center justify-end lg:justify-normal  gap-3 border border-white/10 py-2 bg-white/15 backdrop-blur-xs px-4 rounded-full hover:bg-white/20 transition duration-300 cursor-pointer"
    >
      <h1 className="text-sm font-medium">{name}</h1>

      <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-500 flex items-center justify-center bg-gray-200">
        {photo ? (
          <img
            src={photo}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs font-bold text-white bg-linear-to-br from-purple-500 to-pink-500 w-full h-full flex items-center justify-center">
            {initial}
          </span>
        )}
      </div>
    </Link>
  );
};

export default Profile;
