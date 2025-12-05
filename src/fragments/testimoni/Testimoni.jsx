import Marquee from "react-fast-marquee";
import { PesanTestimoni } from "../../components/testimoni/PesanTestimoni";

const testimonialData = [
  {
    initial: "A",
    name: "Aulia Putri",
    message:
      "Gantungan kunci customnya lucu banget, hasil warnanya juga sesuai request!",
  },
  {
    initial: "D",
    name: "Dimas Rahman",
    message:
      "Stiker custom kualitasnya bagus, tidak mudah terkelupas. Recommended!",
  },
  {
    initial: "S",
    name: "Siti Marlina",
    message:
      "Pengiriman cepat dan hasil gantungan kunci sangat rapi. Bakal order lagi!",
  },
  {
    initial: "N",
    name: "Nandika Rizky Prapanca",
    message: "Bahannya bagus tidak mudah terkelupas!",
  },
  {
    initial: "T",
    name: "Taufan Afandi",
    message: "Bagus Kualitasnya oke",
  },
];

export default function Testimoni() {
  return (
    <div className="xl:px-52 lg:px-20 md:px-12 px-6 min-h-screen flex flex-col justify-center">
      <h1 className="tracking-tighter text-5xl font-extrabold text-center">
        Testimoni
      </h1>

      <p className="mt-5 mb-10 lg:text-lg text-center opacity-80">Cerita dan pengalaman asli dari pelanggan yang telah mempercayai layanan dan produk kami.</p>

      <Marquee pauseOnHover={true} gradient={false} speed={40}>
        {testimonialData.map((item, index) => (
          <PesanTestimoni
            key={index}
            initial={item.initial}
            name={item.name}
            message={item.message}
          />
        ))}
      </Marquee>
    </div>
  );
}
