import React from "react";
import AboutGoal from "../../components/about/AboutGoal";
import LatestNewsOne from "../../components/blogs/LatestNewsOne";
import Clients from "../../components/brand-logo/Clients";
import Contact from "../../components/contact/Contact";
import FeatureImg from "../../components/features/FeatureImg";
import Footer from "../../components/layout/footer/Footer";
import Navbar from "../../components/layout/header/Navbar";
import Layout from "../../components/layout/Layout";
import Price from "../../components/prices/Price";
import PromoTwo from "../../components/promo/PromoTwo";
import VideoPromoTwo from "../../components/promo/VideoPromoTwo";
import Screenshot from "../../components/screenshot/Screenshot";
import Team from "../../components/team/Team";
import BrandCarousel from "../../components/testimonial/BrandCarousel";
import TestimonialTwo from "../../components/testimonial/TestimonialTwo";
import HeroFive from "./HeroFive";

export default function HomeFive() {
  return (
    <Layout>
      <Navbar darkBg />
      <HeroFive />
      <Clients />
      <PromoTwo />
      <AboutGoal />
      <VideoPromoTwo />
      <FeatureImg ImgSource="assets/img/image-15.png" />
      <Price />
      <Screenshot hasBg />
      <LatestNewsOne bgColor="primary-bg" />
      <Team hasTitle />
      <TestimonialTwo hasBg />
      <Contact />
      <BrandCarousel hasBg />
      <Footer />
    </Layout>
  );
}
