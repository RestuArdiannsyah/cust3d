import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings,
  Package,
  BarChart3,
  X
} from "lucide-react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-zinc-900/50 backdrop-blur-sm border-r border-white/10 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header Sidebar */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Owner Panel</h2>
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
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive
                        ? "bg-white/5 border border-white/10 text-white"
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                O
              </div>
              <div>
                <p className="text-sm font-medium text-white">Owner</p>
                <p className="text-xs text-zinc-400">owner@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;