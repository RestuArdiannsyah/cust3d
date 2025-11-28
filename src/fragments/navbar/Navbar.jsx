import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/FirebaseConfig"; // Sesuaikan dengan path Anda
import Logo from "../../components/navbar/Logo";
import Nav from "../../components/navbar/Nav";
import ButtonLogin from "../../components/navbar/ButtonLogin";
import Profile from "../../components/navbar/Profile";
import { Menu } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full pt-6 xl:px-52 lg:px-28 md:px-16 px-6 flex items-center justify-between z-50">
        {/* LEFT */}
        <Logo />

        {/* MIDDLE (Desktop Only) */}
        <div className="hidden md:block">
          <Nav />
        </div>

        {/* RIGHT (Desktop Only) */}
        <div className="hidden md:block">
          {loading ? (
            <div className="w-10 h-10 rounded-full animate-pulse opacity-50" />
          ) : user ? (
            <Profile />
          ) : (
            <ButtonLogin />
          )}
        </div>

        {/* MOBILE HAMBURGER */}
        <button 
          className="md:hidden p-2 rounded-lg transition-opacity hover:opacity-70"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <Menu size={28} />
        </button>
      </nav>

      {/* MOBILE DROPDOWN OVERLAY */}
      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="fixed top-[88px] left-0 right-0 backdrop-blur-lg p-6 md:hidden flex flex-col gap-6 z-40 animate-slideDown">
            {/* Navigation Links */}
            <div className="pb-4">
              <Nav />
            </div>
            
            {/* Auth Section */}
            <div className="pt-2">
              {loading ? (
                <div className="w-full h-12 rounded-lg animate-pulse opacity-50" />
              ) : user ? (
                <Profile />
              ) : (
                <ButtonLogin />
              )}

            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;