import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";
import Sidebar from "../components/owner/Sidebar";
import Footer from "../fragments/footer/Footer";

const OwnerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header dengan tombol menu untuk mobile */}
        <header className="lg:hidden bg-zinc-900/50 backdrop-blur-sm border-b border-white/10 p-4">
          <button
            onClick={toggleSidebar}
            className="text-zinc-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default OwnerLayout;
