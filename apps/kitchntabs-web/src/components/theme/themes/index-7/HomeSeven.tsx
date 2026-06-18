import React from "react";
import LatestNewsOne from "../../components/blogs/LatestNewsOne";
import Contact from "../../components/contact/Contact";
import Cta from "../../components/cta/Cta";
import FeatureImgThree from "../../components/features/FeatureImgThree";
import FeatureImgTwo from "../../components/features/FeatureImgTwo";
import Footer from "../../components/layout/footer/Footer";
import Navbar from "../../components/layout/header/Navbar";
import Layout from "../../components/layout/Layout";
import Subsribe from "../../components/newsletter/Subsribe";
import Price from "../../components/prices/Price";
import Promo from "../../components/promo/Promo";
import Screenshot from "../../components/screenshot/Screenshot";
import Team from "../../components/team/Team";
import BrandCarousel from "../../components/testimonial/BrandCarousel";
import TestimonialTwo from "../../components/testimonial/TestimonialTwo";
import HeroSeven from "./HeroSeven";

export default function HomeSeven() {
  return (
    <Layout>
      <Navbar darkBg />
      <HeroSeven />
      <Promo />
      <FeatureImgTwo />
      <FeatureImgThree />
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
