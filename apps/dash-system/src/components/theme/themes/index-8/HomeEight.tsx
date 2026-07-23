import React from "react";
import LatestNewsOne from "../../components/blogs/LatestNewsOne";
import Contact from "../../components/contact/Contact";
import CounterTwo from "../../components/counter/CounterTwo";
import FeatureImg from "../../components/features/FeatureImg";
import FeatureImgTwo from "../../components/features/FeatureImgTwo";
import Footer from "../../components/layout/footer/Footer";
import Navbar from "../../components/layout/header/Navbar";
import Layout from "../../components/layout/Layout";
import Subsribe from "../../components/newsletter/Subsribe";
import Price from "../../components/prices/Price";
import VideoPromo from "../../components/promo/VideoPromo";
import Screenshot from "../../components/screenshot/Screenshot";
import Team from "../../components/team/Team";
import BrandCarousel from "../../components/testimonial/BrandCarousel";
import HeroEight from "./HeroEight";

export default function HomeEight() {
  return (
    <Layout>
      <Navbar classOption="custom-header" />
      <HeroEight />
      <CounterTwo />
      <FeatureImgTwo />
      <FeatureImg ImgSource="assets/img/image-10.png" />
      <VideoPromo />
      <Price />
      <Screenshot hasBg />
      <LatestNewsOne bgColor="primary-bg" />
      <Team />
      <Contact bgColor="gray-light-bg" />
      <BrandCarousel />
      <Subsribe />
      <Footer space />
    </Layout>
  );
}
