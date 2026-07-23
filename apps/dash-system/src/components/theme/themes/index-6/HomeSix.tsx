import React from "react";
import Layout from "../../components/layout/Layout";
import Navbar from "../../components/layout/header/Navbar";
import HeroSix from "./HeroSix";
import Promo from "../../components/promo/Promo";
import Price from "../../components/prices/Price";
import LatestNewsOne from "../../components/blogs/LatestNewsOne";
import Team from "../../components/team/Team";
import Contact from "../../components/contact/Contact";
import Subsribe from "../../components/newsletter/Subsribe";
import Footer from "../../components/layout/footer/Footer";
import BrandCarousel from "../../components/testimonial/BrandCarousel";
import TestimonialTwo from "../../components/testimonial/TestimonialTwo";
import Screenshot from "../../components/screenshot/Screenshot";
import Cta from "../../components/cta/Cta";
import FeatureImgFour from "../../components/features/FeatureImgFour";
import AboutTwo from "../../components/about/AboutTwo";

export default function HomeSix() {
  return (
    <Layout>
      <Navbar darkBg />
      <HeroSix />
      <Promo />
      <AboutTwo />
      <FeatureImgFour />
      <Price hasBg />
      <TestimonialTwo />
      <Screenshot hasBg />
      <Cta />
      <LatestNewsOne bgColor="gray-light-bg" light />
      <Team />
      <Contact bgColor="gray-light-bg" />
      <BrandCarousel />
      <Subsribe />
      <Footer space />
    </Layout>
  );
}
