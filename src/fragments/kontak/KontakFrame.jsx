import { useState } from "react";
import { Send, Instagram, Facebook, MessageCircle } from "lucide-react";
import restu from "../../assets/kontak/restu.jpg";
import alif from "../../assets/kontak/alif.jpg";

const KontakFrame = () => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    pesan: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log("Form submitted:", formData);

      // Simulasi pengiriman
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Pesan berhasil dikirim!");
      setFormData({ nama: "", email: "", pesan: "" });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const teamMembers = [
    {
      name: "Restu Ardiansyah",
      nim: "A11.2023.15194",
      img: restu, // Hapus kurung kurawal
    },
    {
      name: "Muhamad Fikri Alif Karim",
      nim: "A11.2023.15180",
      img: alif, // Hapus kurung kurawal
    },
  ];

  const socialMedia = [
    {
      icon: <Instagram className="w-5 h-5" />,
      label: "@customstore",
      link: "https://www.instagram.com/cust3d",
    },
    // {
    //   icon: <Facebook className="w-5 h-5" />,
    //   label: "Custom Store",
    //   link: "#",
    // },
    // {
    //   icon: <MessageCircle className="w-5 h-5" />,
    //   label: "+62 812 3456 7890",
    //   link: "#",
    // },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#070016] items-center justify-center gap-8 lg:gap-20 xl:px-52 lg:px-20 md:px-12 px-6 pt-28 lg:pt-0">
      {/* LEFT - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center order-2 lg:order-1">
        <div className="w-full max-w-md space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="text-left">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Hubungi Kami
            </h1>
            <p className="text-sm lg:text-base text-zinc-400">
              Siap mewujudkan design custom impianmu? Hubungi kami sekarang!
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4 lg:space-y-6">
            {/* Nama */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Masukkan nama anda"
                disabled={loading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@example.com"
                disabled={loading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Pesan */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Pesan</label>
              <textarea
                name="pesan"
                value={formData.pesan}
                onChange={handleChange}
                placeholder="Ceritakan tentang project atau pertanyaan anda..."
                rows="5"
                disabled={loading}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 px-4 border border-white/20 bg-white/15 rounded-lg items-center justify-center  hover:bg-white/25 transition duration-300 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span>{loading ? "Mengirim..." : "Kirim Pesan"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT - Team & Social Section */}
      <div className="w-full lg:w-1/2 relative overflow-hidden order-1 lg:order-2">
        <div className="h-full flex flex-col justify-center space-y-6 lg:space-y-8">
          {/* Team Members */}
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 lg:mb-6">
              Tim Kami
            </h2>

            <div className="space-y-3 lg:space-y-4">
              {teamMembers.map((member, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 transition-all group"
                >
                  <div className="relative">
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-purple-500/50 group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{member.name}</h3>
                    <p className="text-sm text-zinc-400">NIM: {member.nim}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 lg:mb-6">
              Sosial Media
            </h2>

            <div className="space-y-3 lg:space-y-4">
              {socialMedia.map((social, i) => (
                <a
                  key={i}
                  href={social.link}
                  className="flex items-center gap-3 text-zinc-300 hover:text-white transition-colors group"
                >
                  <div className="text-purple-400 group-hover:text-purple-300 transition-colors">
                    {social.icon}
                  </div>
                  <span className="font-medium">{social.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KontakFrame;
