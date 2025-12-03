import { Link, NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  Package,
  BarChart3,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const { user, userData } = useAuth();

  const name = userData?.nama || user?.displayName || "User";
  const photo = userData?.photoURL || user?.photoURL;
  const initial =
    userData?.firstName?.[0] ||
    user?.email?.[0]?.toUpperCase() ||
    name[0]?.toUpperCase() ||
    "C";

  const menuItems = [
    { path: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/owner/produk", label: "Produk", icon: Package },
    { path: "/owner/pesanan", label: "Pesanan", icon: ShoppingBag },
    { path: "/owner/pelanggan", label: "Pelanggan", icon: Users },
    { path: "/owner/laporan", label: "Laporan", icon: BarChart3 },
    { path: "/owner/pengaturan", label: "Pengaturan", icon: Settings },
  ];

  return (
    <>
      {/* Overlay untuk mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:fixed inset-y-0 left-0 z-50 w-[285px] backdrop-blur-sm border-r border-white/10 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header Sidebar */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">
              Owner Panel{" "}
              <Link
                to="/"
                className="caveat hover:underline transition duration-300"
              >
                Cust3d
              </Link>
            </h2>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-zinc-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;

              // Custom active rule for Produk
              const isProdukActive =
                location.pathname.startsWith("/owner/produk") ||
                location.pathname.startsWith("/owner/tambah-produk") ||
                location.pathname.startsWith("/owner/detail-produk");

              const active =
                item.path === "/owner/produk"
                  ? isProdukActive
                  : location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                    ${
                      active
                        ? "bg-white/5 border border-white/10 text-white"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer Sidebar - Profile */}
          <div className="p-4 border-t border-white/10">
            <NavLink
              to="/owner/profile"
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-white/10 text-white border border-white/10"
                    : "hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {/* Profile Image or Initial */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                {photo ? (
                  <img
                    src={photo}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback jika gambar error
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <span
                  className="text-white font-bold"
                  style={{ display: photo ? "none" : "flex" }}
                >
                  {initial}
                </span>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {name}
                </p>
                <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
              </div>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;