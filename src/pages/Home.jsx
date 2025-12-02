import React from "react";
import HomeFrame from "../fragments/home/HomeFrame";
import AboutFrame from "../fragments/about/AboutFrame";
import AlurPemesananFrame from "../fragments/alurPemesanan/AlurPemesananFrame";
import ProdukFrame from "../fragments/produk/ProdukFrame";
import Testimoni from "../fragments/testimoni/Testimoni";
import KontakFrame from "../fragments/kontak/KontakFrame";
import Footer from "../fragments/footer/Footer";

const Home = () => {
  return (
    <div>
      <section id="home">
        <HomeFrame />
      </section>

      <section id="tentang-kami">
        <AboutFrame />
      </section>

      <section id="alur-pemesanan">
        <AlurPemesananFrame />
      </section>

      <section id="produk">
        <ProdukFrame />
      </section>

      <section id="testimoni">
        <Testimoni />
      </section>

      <section id="kontak">
        <KontakFrame />
      </section>

      <section>
        <Footer />
      </section>
    </div>
  );
};

export default Home;
