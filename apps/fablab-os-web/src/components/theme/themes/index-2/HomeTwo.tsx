import Footer from "../../components/layout/footer/Footer";
import AboutApp from "../../components/about/AboutApp";
import AccordionWithImg from "../../components/Faqs/AccordionWithImg";
import LatestNewsOne from "../../components/blogs/LatestNewsOne";
import Contact from "../../components/contact/Contact";
import FeatureImg from "../../components/features/FeatureImg";
import Navbar from "../../components/layout/header/Navbar";
import Layout from "../../components/layout/Layout";
import Price from "../../components/prices/Price";
import PromoTwo from "../../components/promo/PromoTwo";
import VideoPromoTwo from "../../components/promo/VideoPromoTwo";
import TeamTwo from "../../components/team/TeamTwo";
import HeroTwo from "./HeroTwo";
import Subsribe from "../../components/newsletter/Subsribe";
import BrandCarousel from "../../components/testimonial/BrandCarousel";
import TestimonialTwo from "../../components/testimonial/TestimonialTwo";
import Screenshot from "../../components/screenshot/Screenshot";

export default function HomeTwo() {
  return (
    <Layout>
      <Navbar darkBg />
      <HeroTwo />
      <PromoTwo />
      <AboutApp />
      <FeatureImg ImgSource="assets/img/image-10.png" />
      <VideoPromoTwo />
      <Price />
      <TestimonialTwo />
      <Screenshot hasBg />
      <AccordionWithImg />
      <LatestNewsOne light bgColor="gray-light-bg" />
      <TeamTwo />
      <Contact bgColor="gray-light-bg" />
      <BrandCarousel />
      <Subsribe />
      <Footer space />
    </Layout>
  );
}
