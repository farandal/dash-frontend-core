import Contact from "../../components/contact/Contact";
import Cta from "../../components/cta/Cta";
import Features from "../../components/features/Features";
import FeaturesTwo from "../../components/features/FeaturesTwo";
import Footer from "../../components/layout/footer/Footer";
import Navbar from "../../components/layout/header/Navbar";
import Layout from "../../components/layout/Layout";
import Subsribe from "../../components/newsletter/Subsribe";
import Accordion from "../../components/Faqs/Accordion";
import Price from "../../components/prices/Price";
import Promo from "../../components/promo/Promo";
import Team from "../../components/team/Team";
import HeroOne from "./HeroOne";
import LatestNewsOne from "../../components/blogs/LatestNewsOne";
import VideoPromo from "../../components/promo/VideoPromo";
import BrandCarousel from "../../components/testimonial/BrandCarousel";
import TestimonialTwo from "../../components/testimonial/TestimonialTwo";
import Screenshot from "../../components/screenshot/Screenshot";

export default function HomeOne() {
  return (
    <Layout>
      <Navbar darkBg />
      <HeroOne />
      <Promo />
      <Features />
      <FeaturesTwo />
      <Cta />
      <Price />
      <Accordion />
      <TestimonialTwo />
      <VideoPromo />
      <Screenshot />
      <Team />
      <LatestNewsOne />
      <Contact bgColor />
      <BrandCarousel />
      <Subsribe />
      <Footer space />
    </Layout>
  );
}
