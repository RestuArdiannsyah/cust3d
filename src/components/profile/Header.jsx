const Header = ({ user, userData,  }) => {
  return (
    <div>
      <div className="flex items-start gap-6 mb-8 pb-8 border-b border-white/10">
        <div className="relative">
          {userData?.photoURL || user?.photoURL ? (
            <img
              src={userData?.photoURL || user?.photoURL}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-purple-500"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-purple-500">
              {userData?.firstName?.[0] ||
                user?.email?.[0]?.toUpperCase() ||
                "U"}
            </div>
          )}

          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-[#070016]"></div>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-1">
            {userData?.nama || user?.displayName || "User"}
          </h2>
          <p className="text-zinc-400 mb-2">{userData?.email || user?.email}</p>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
              {userData?.role || "user"}
            </span>
            <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-medium">
              {userData?.status || "active"}
            </span>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Header;
