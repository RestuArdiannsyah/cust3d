import { useState } from "react";
import { registerWithEmail, registerWithGoogle } from "../services/auth/AuthServices";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError("Semua field harus diisi");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Password tidak cocok!");
        return;
      }

      if (formData.password.length < 6) {
        setError("Password minimal 6 karakter");
        return;
      }

      if (!agreedToTerms) {
        setError("Anda harus menyetujui Syarat & Ketentuan");
        return;
      }

      setLoading(true);

      // Register dengan email
      const result = await registerWithEmail(formData);

      if (result.success) {
        navigate("/login");
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

  const handleGoogleRegister = async () => {
    try {
      setError("");
      setLoading(true);

      const result = await registerWithGoogle();

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

  return (
    <div className="min-h-screen flex">
      {/* LEFT - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">
              Daftar <a href="/" className="caveat">cust3D</a>
            </h1>
            <p className="text-zinc-400">Daftar untuk mulai menggunakan layanan kami</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Nama depan"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Nama belakang"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Masukkan email"
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
                placeholder="Buat password (min. 6 karakter)"
                disabled={loading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Konfirmasi password"
                disabled={loading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={loading}
                className="mt-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label className="text-zinc-400">
                Saya setuju dengan{" "}
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  Syarat & Ketentuan
                </a>{" "}
                serta{" "}
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  Kebijakan Privasi
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 px-4 border border-white/20 bg-white/15 rounded-lg flex items-center justify-center gap-2 hover:bg-white/25 transition duration-300 font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Buat Akun"}
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

            {/* Google Register */}
            <button
              onClick={handleGoogleRegister}
              disabled={loading}
              className="w-full py-3 px-4 bg-white hover:bg-zinc-300 rounded-lg font-semibold text-zinc-900 transition-all duration-300 flex items-center justify-center gap-3 border border-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? "Memproses..." : "Daftar dengan Google"}
            </button>

            {/* Sign In Link */}
            <p className="text-center text-sm text-zinc-400">
              Sudah punya akun?{" "}
              <a
                href="/login"
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                Masuk
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT - Image Section */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1200"
          alt="Register"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-pink-600/30"></div>

        {/* Overlay Content */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-5xl font-bold mb-4">Bergabung Bersama Kami</h2>
            <p className="text-xl text-white/80">
              Buat akun dan mulai perjalanan luar biasa Anda bersama kami
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;