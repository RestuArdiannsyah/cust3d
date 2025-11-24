import { useState } from "react";
import { loginWithEmail, loginWithGoogle } from "../services/auth/AuthServices";
import { useNavigate } from "react-router-dom";
import LogoGoogle from "../assets/google-icon.svg";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error saat user mulai mengetik
    if (error) setError("");
  };

  const handleSubmit = async () => {
    try {
      setError("");

      // Validasi
      if (!formData.email || !formData.password) {
        setError("Email dan password harus diisi");
        return;
      }

      setLoading(true);

      // Login dengan email
      const result = await loginWithEmail(formData.email, formData.password);

      if (result.success) {
        // Simpan "remember me" ke localStorage jika dicentang
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("userEmail", formData.email);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("userEmail");
        }

        navigate("/"); // Redirect ke homepage atau dashboard
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Terjadi kesalahan yang tidak terduga");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      const result = await loginWithGoogle();

      if (result.success) {
        navigate("/"); // Redirect ke homepage atau dashboard
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Terjadi kesalahan yang tidak terduga");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              Selamat Datang Kembali
            </h1>
            <p className="text-zinc-400">
              Masuk untuk melanjutkan ke akun Anda
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Email/Username */}
            <div className="space-y-2">
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="Masukkan email atau nama pengguna"
                disabled={loading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                placeholder="Masukkan kata sandi"
                disabled={loading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="rounded disabled:opacity-50 disabled:cursor-not-allowed"
                />
                Ingat saya
              </label>
              <a
                href="/forgot-password"
                className="text-purple-400 hover:text-purple-300"
              >
                Lupa kata sandi?
              </a>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 px-4 border border-white/20 bg-white/15 rounded-lg flex items-center justify-center gap-2 hover:bg-white/25 transition duration-300 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#070016] text-zinc-400">
                  Atau lanjutkan dengan
                </span>
              </div>
            </div>

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 bg-white hover:bg-zinc-300 rounded-lg font-semibold text-zinc-900 transition-all duration-300 flex items-center justify-center gap-3 border border-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src={LogoGoogle} alt="Google Logo" className="w-5 h-5" />
              {loading ? "Memproses..." : "Masuk dengan Google"}
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-zinc-400">
              Belum punya akun?{" "}
              <a
                href="/register"
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                Daftar
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT - Image Section */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200"
          alt="Login"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-pink-600/30"></div>

        {/* Overlay Content */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-5xl font-bold mb-4">Mulai Perjalanan Anda</h2>
            <p className="text-xl text-white/80">
              Akses berbagai fitur luar biasa dan sesuaikan pengalaman Anda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;