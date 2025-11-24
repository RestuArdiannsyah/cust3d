import { NavLink } from "react-router-dom";
import { UserRound, Settings, Handbag } from "lucide-react";

const ProfileMenu = () => {
  const menuItems = [
    { path: "/profile", label: "Informasi Profil", icon: UserRound },
    { path: "/profile/pesanan", label: "Pesanan", icon: Handbag },
    { path: "/profile/pengaturan", label: "Pengaturan", icon: Settings },
  ];

  return (
    <div className=" rounded-2xl p-2 backdrop-blur-sm mb-6">
      <div className="flex gap-2 overflow-x-auto">
        {menuItems.map((item) => {
          const Icon = item.icon; // ambil komponen ikon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/profile"}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white/5 border border-white/10"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {/* Render component icon */}
              <span className="text-lg flex items-center">
                <Icon size={18} />
              </span>

              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileMenu;
