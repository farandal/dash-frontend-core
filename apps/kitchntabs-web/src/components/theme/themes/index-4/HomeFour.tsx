import LatestNewsOne from "../../components/blogs/LatestNewsOne";
import Contact from "../../components/contact/Contact";
import FaqStatic from "../../components/Faqs/FaqStatic";
import FeatureImgThree from "../../components/features/FeatureImgThree";
import FeatureImgTwo from "../../components/features/FeatureImgTwo";
import Footer from "../../components/layout/footer/Footer";
import Navbar from "../../components/layout/header/Navbar";
import Layout from "../../components/layout/Layout";
import Subsribe from "../../components/newsletter/Subsribe";
import Price from "../../components/prices/Price";
import Promo from "../../components/promo/Promo";
import VideoPromoTwo from "../../components/promo/VideoPromoTwo";
import Screenshot from "../../components/screenshot/Screenshot";
import Team from "../../components/team/Team";
import BrandCarousel from "../../components/testimonial/BrandCarousel";
import HeroFour from "./HeroFour";

export default function HomeFour() {
  return (
    <Layout>
      <Navbar darkBg />
      <HeroFour />
      <Promo />
      <FeatureImgTwo />
      <FeatureImgThree />
      <VideoPromoTwo />
      <Price hasBg />
      <FaqStatic />
      <Screenshot />
      <Team bgColor="gray-light-bg" />
      <LatestNewsOne light />
      <Contact bgColor />
      <BrandCarousel />
      <Subsribe />
      <Footer space />
    </Layout>
  );
}
