import { useState } from "react";
import { resetPassword } from "../services/auth/AuthServices";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    try {
      setError("");
      setSuccess(false);

      // Validasi
      if (!email) {
        setError("Email harus diisi");
        return;
      }

      // Validasi format email sederhana
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Format email tidak valid");
        return;
      }

      setLoading(true);

      // Kirim reset password email
      const result = await resetPassword(email);

      if (result.success) {
        setSuccess(true);
        // Auto redirect setelah 3 detik
        setTimeout(() => {
          navigate("/login");
        }, 3000);
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
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Lupa Kata Sandi?
          </h1>
          <p className="text-zinc-400">
            Masukkan email Anda dan kami akan mengirimkan link untuk reset password
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-400 text-sm">
              Link reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam.
              Anda akan diarahkan ke halaman login dalam 3 detik...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              onKeyPress={handleKeyPress}
              placeholder="Masukkan email Anda"
              disabled={loading || success}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className="w-full py-3 px-4 border border-white/20 bg-white/15 rounded-lg flex items-center justify-center gap-2 hover:bg-white/25 transition duration-300 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Mengirim..." : success ? "Email Terkirim!" : "Kirim Link Reset"}
          </button>

          {/* Back to Login */}
          <div className="text-center">
            <a
              href="/login"
              className="text-sm text-purple-400 hover:text-purple-300 font-semibold"
            >
              ← Kembali ke Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;