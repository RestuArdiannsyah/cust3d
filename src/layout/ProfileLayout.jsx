import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import Header from "../components/profile/Header";
import Footer from "../fragments/footer/Footer";
import ProfileMenu from "../components/profile/ProfileMenu";

const ProfileLayout = () => {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="xl:px-52 lg:px-28 md:px-16 lg:py-10 p-6">
      <Header
        user={user}
        userData={userData}
        // handleLogout={handleLogout}
        // isLoggingOut={isLoggingOut}
      />

      <ProfileMenu />

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default ProfileLayout;
