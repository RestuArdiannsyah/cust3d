import LiquidEther from "../../components/background/Background";
import CardSwap from "../../components/home/CardSwap";
import { Card } from "../../components/home/CardSwap";
import logocust3d from "../../assets/cust3d.png";

const HomeFrame = () => {
  return (
    <div
      className="
        relative w-full min-h-screen overflow-hidden 
        flex flex-col lg:flex-row
        justify-center items-center
        gap-8 lg:gap-16
        xl:px-52 lg:px-20 md:px-12 px-6
        py-12 lg:py-0"
    >
      {/* Background */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-none">
        <LiquidEther
          colors={["#ffffff", "#ffffff", "#ffffff"]}
          mouseForce={10}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.2}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.1}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
        {/* Left - Text Content */}
        <div className="flex-1 max-w-2xl lg:max-w-xl">
          <h1 className="tracking-tighter text-5xl md:text-6xl font-extrabold inset-shadow-blue-900">
            Buat Aksesoris Custommu Bersama{" "}
            <span
              className="ml-3 caveat font-bold relative inline-block z-10
                         before:absolute before:-inset-1 before:block
                         before:-skew-y-4 before:bg-blue-600 before:-z-10"
            >
              cust3D
            </span>
          </h1>
          <p className="text-lg md:text-xl mt-6 text-zinc-400 leading-relaxed">
            Jadikan setiap aksesorismu unik! Temukan bagaimana Cust3D mengubah
            ide dan foto favoritmu menjadi desain keren di berbagai produk.
          </p>
        </div>

        {/* Right - Card Swap */}
        <div className="shrink-0 w-full lg:w-auto flex justify-center lg:justify-end">
          <div style={{ height: "400px", position: "relative" }}>
            <CardSwap
              cardDistance={60}
              verticalDistance={70}
              delay={5000}
              pauseOnHover={false}
            >
              <Card className="border-4">
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80"
                    alt="Accessories Design"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Aksesoris Custom
                    </h3>
                    <p className="text-zinc-200">
                      Gantungan kunci, Stiker, Totebag
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="border-4">
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  <img
                    src={logocust3d}
                    alt="Custom T-shirt Design"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      cust3d
                    </h3>
                    <p className="text-zinc-200">
                      Buat aksesoris custommu sesuai keinginanmu
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-4">
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500&q=80"
                    alt="Custom Mug Design"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Mug & Tumbler
                    </h3>
                    <p className="text-zinc-200">
                      Pilih desain menarik untuk fotomu
                    </p>
                  </div>
                </div>
              </Card>
            </CardSwap>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeFrame;
