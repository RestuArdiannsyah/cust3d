import CardImg from "../../components/home/CardImg";
import about from "../../assets/about.jpg";

const AboutFrame = () => {
  return (
    <div
      className="
        relative w-full min-h-screen overflow-hidden 
        flex flex-col lg:flex-row
        items-center justify-center
        gap-20
        xl:px-52 lg:px-20 md:px-12 lg:pt-0 md:pt-0 pt-18 px-6
      "
    >
      {/* LEFT SECTION (Gambar) */}
      <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start">
        <h1 className="tracking-tighter text-5xl font-extrabold mb-10 text-center lg:text-left">
          Tentang Kami
        </h1>

        <div
          className="
            flex flex-wrap lg:flex-nowrap 
            items-center justify-center 
            gap-12
            grayscale
            border border-white/20
            p-12 rounded-xl
            hover:grayscale-0 transition duration-300
          "
        >
          {/* Card 1 */}
          <CardImg
            imageSrc="https://images.unsplash.com/photo-1594377157609-5c996118ac7f?q=80&w=1170&auto=format&fit=crop"
            altText="Ide Bisnis"
            captionText="Ide Bisnis"
            containerHeight="280px"
            containerWidth="280px"
            imageHeight="280px"
            imageWidth="280px"
            rotateAmplitude={12}
            scaleOnHover={1.1}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={true}
            overlayContent={
              <p className="font-bold m-6 py-2 px-4 rounded-lg bg-zinc-700/50 shadow-lg">
                Ide Bisnis
              </p>
            }
          />

          {/* Card 2 */}
          <CardImg
            imageSrc={about}
            altText="Tentang Kami"
            captionText="Tentang Kami"
            containerHeight="280px"
            containerWidth="280px"
            imageHeight="280px"
            imageWidth="280px"
            rotateAmplitude={12}
            scaleOnHover={1.1}
            showMobileWarning={false}
            showTooltip={true}
            displayOverlayContent={true}
            overlayContent={
              <p className="font-bold m-6 py-2 px-4 rounded-lg bg-zinc-700/50 shadow-lg">
                Tentang Kami
              </p>
            }
          />
        </div>
      </div>

      {/* RIGHT SECTION (Tulisan) */}
      <div
        className="
          w-full lg:w-1/2 
          border border-white/20 
          p-8 rounded-xl 
          leading-relaxed text-zinc-300
          bg-white/10
          flex flex-col items-center lg:items-start
          text-center lg:text-left
          backdrop-blur-lg
          z-10
        "
      >
        <h1 className="text-3xl font-bold mb-4">
          Apa itu <span className="caveat">Cust3D </span>?
        </h1>

        <p className="text-lg">
          Cust3D adalah bisnis kreatif yang menyediakan aksesoris custom seperti
          gantungan kunci, stiker, totebag, dan lainnya. Pelanggan dapat
          mengirimkan foto atau desain sendiri, lalu kami ubah menjadi produk
          unik sesuai keinginan.
        </p>

        <p className="text-lg mt-4">
          Setiap produk dibuat dengan kualitas terbaik dan sentuhan personal,
          cocok untuk hadiah spesial, acara, pernikahan, maupun kebutuhan
          promosi.
        </p>
      </div>
    </div>
  );
};

export default AboutFrame;
